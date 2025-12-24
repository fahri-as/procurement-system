package controllers

import (
	"fmt"
	"log"
	"time"

	"procurement-system/config"
	"procurement-system/models"
	"procurement-system/repository"
	"procurement-system/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
)

type PurchasingController struct {
	purchasingRepo *repository.PurchasingRepository
	itemRepo       *repository.ItemRepository
	supplierRepo   *repository.SupplierRepository
}

// NewPurchasingController creates a new PurchasingController instance
func NewPurchasingController() *PurchasingController {
	return &PurchasingController{
		purchasingRepo: repository.NewPurchasingRepository(),
		itemRepo:       repository.NewItemRepository(),
		supplierRepo:   repository.NewSupplierRepository(),
	}
}

// CreatePurchasingRequest represents the request body for creating a purchasing transaction
type CreatePurchasingRequest struct {
	SupplierID uint                    `json:"supplierId" validate:"required"`
	Details    []PurchasingDetailInput `json:"details" validate:"required,min=1,dive"`
}

// PurchasingDetailInput represents a purchasing detail item in the request
type PurchasingDetailInput struct {
	ItemID uint `json:"itemId" validate:"required"`
	Qty    int  `json:"qty" validate:"required,min=1"`
	// Note: Price and SubTotal are NOT accepted from client - calculated server-side
}

// PurchasingResponse represents the response after creating a purchasing transaction
type PurchasingResponse struct {
	Message    string                    `json:"message"`
	Purchasing models.Purchasing         `json:"purchasing"`
	Details    []models.PurchasingDetail `json:"details"`
}

// Create handles creating a new purchasing transaction
// - Server-side calculation of prices from Items table
// - Database transaction (ACID) with automatic rollback on error
// - Automatic stock update
// - Webhook notification after successful commit
func (pc *PurchasingController) Create(c *fiber.Ctx) error {
	var req CreatePurchasingRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get UserID from JWT middleware (stored in locals)
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "User ID not found in token",
		})
	}

	// Validate supplier exists
	_, err := pc.supplierRepo.FindByID(req.SupplierID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Supplier not found",
		})
	}

	// Prepare purchasing details with server-side price calculation
	var details []models.PurchasingDetail
	var grandTotal decimal.Decimal = decimal.Zero

	for _, detailInput := range req.Details {
		// Get item from database to fetch current price
		item, err := pc.itemRepo.FindByID(detailInput.ItemID)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": fmt.Sprintf("Item with ID %d not found", detailInput.ItemID),
			})
		}

		// Ensure item belongs to the selected supplier
		if item.SupplierID != req.SupplierID {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": fmt.Sprintf("Item %d does not belong to supplier %d", detailInput.ItemID, req.SupplierID),
			})
		}

		// Server-side calculation: SubTotal = Price * Qty
		subTotal := item.Price.Mul(decimal.NewFromInt(int64(detailInput.Qty)))

		// Add to grand total
		grandTotal = grandTotal.Add(subTotal)

		// Create purchasing detail
		detail := models.PurchasingDetail{
			ItemID:   detailInput.ItemID,
			Qty:      detailInput.Qty,
			SubTotal: subTotal,
		}
		details = append(details, detail)
	}

	// Create purchasing header
	purchasing := models.Purchasing{
		Date:       time.Now(),
		SupplierID: req.SupplierID,
		UserID:     userID,
		GrandTotal: grandTotal,
	}

	// Create transaction with ACID properties
	// This ensures atomicity: Insert Header + Insert Details + Update Stock
	// If any step fails, all changes are rolled back automatically
	err = pc.purchasingRepo.CreatePurchasingTransaction(
		&purchasing,
		details,
		pc.itemRepo.UpdateStockWithTx,
	)

	if err != nil {
		// Transaction was rolled back automatically by GORM
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create purchasing transaction: " + err.Error(),
		})
	}

	// Transaction committed successfully at this point
	// All three operations (Header, Details, Stock Update) are now permanent in database

	// Reload purchasing with relationships for response
	var purchasingWithRelations models.Purchasing
	var detailsWithRelations []models.PurchasingDetail

	config.DB.Preload("Supplier").Preload("User").First(&purchasingWithRelations, purchasing.ID)
	config.DB.Where("purchasing_id = ?", purchasing.ID).Preload("Item").Find(&detailsWithRelations)

	// External Integration: Send webhook notification AFTER successful database commit
	// Webhook is sent asynchronously (non-blocking) so it doesn't delay the HTTP response
	// Webhook URL priority:
	// 1. HTTP Header: X-Webhook-URL (optional override)
	// 2. Environment Variable: WEBHOOK_URL (default from config)
	webhookURL := c.Get("X-Webhook-URL") // Optional: webhook URL from header (override)
	if webhookURL == "" {
		webhookURL = config.WebhookURL // Use default from environment variable
	}

	if webhookURL != "" {
		// Send webhook in goroutine (fire and forget)
		// This ensures webhook failure doesn't affect the transaction response
		go func() {
			if err := utils.SendWebhook(webhookURL, &purchasingWithRelations, detailsWithRelations); err != nil {
				log.Printf("Webhook error (non-blocking): %v", err)
			}
		}()
	}

	return c.Status(fiber.StatusCreated).JSON(PurchasingResponse{
		Message:    "Purchasing transaction created successfully",
		Purchasing: purchasingWithRelations,
		Details:    detailsWithRelations,
	})
}
