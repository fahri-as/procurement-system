package controllers

import (
	"strconv"

	"procurement-system/models"
	"procurement-system/repository"

	"github.com/gofiber/fiber/v2"
	"github.com/shopspring/decimal"
)

// ItemController handles item-related HTTP requests
type ItemController struct {
	itemRepo     *repository.ItemRepository
	supplierRepo *repository.SupplierRepository
}

// NewItemController creates a new ItemController instance
func NewItemController(db interface{}) *ItemController {
	return &ItemController{
		itemRepo:     repository.NewItemRepository(),
		supplierRepo: repository.NewSupplierRepository(),
	}
}

// CreateItemRequest represents the request body for creating an item
type CreateItemRequest struct {
	Name       string          `json:"name" validate:"required"`
	Stock      int             `json:"stock" validate:"min=0"`
	Price      decimal.Decimal `json:"price" validate:"required,min=0"`
	SupplierID uint            `json:"supplierId" validate:"required"`
}

// UpdateItemRequest represents the request body for updating an item
type UpdateItemRequest struct {
	Name       string          `json:"name" validate:"required"`
	Stock      int             `json:"stock" validate:"min=0"`
	Price      decimal.Decimal `json:"price" validate:"required,min=0"`
	SupplierID uint            `json:"supplierId" validate:"required"`
}

// GetAll retrieves all items
func (ic *ItemController) GetAll(c *fiber.Ctx) error {
	supplierIDParam := c.Query("supplierId")
	var (
		items []models.Item
		err   error
	)

	if supplierIDParam != "" {
		supplierID, err := strconv.ParseUint(supplierIDParam, 10, 32)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid supplier ID",
			})
		}

		// Ensure supplier exists
		if _, err := ic.supplierRepo.FindByID(uint(supplierID)); err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Supplier not found",
			})
		}

		items, err = ic.itemRepo.GetAllBySupplier(uint(supplierID))
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to retrieve items",
			})
		}
	} else {
		items, err = ic.itemRepo.GetAll()
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to retrieve items",
			})
		}
	}

	return c.JSON(fiber.Map{
		"message": "Items retrieved successfully",
		"data":    items,
	})
}

// Create creates a new item
func (ic *ItemController) Create(c *fiber.Ctx) error {
	var req CreateItemRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate supplier exists
	if _, err := ic.supplierRepo.FindByID(req.SupplierID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Supplier not found",
		})
	}

	item := models.Item{
		Name:       req.Name,
		Stock:      req.Stock,
		Price:      req.Price,
		SupplierID: req.SupplierID,
	}

	if err := ic.itemRepo.Create(&item); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create item",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Item created successfully",
		"data":    item,
	})
}

// Update updates an existing item
func (ic *ItemController) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid item ID",
		})
	}

	// Check if item exists
	item, err := ic.itemRepo.FindByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Item not found",
		})
	}

	var req UpdateItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	item.Name = req.Name
	item.Stock = req.Stock
	item.Price = req.Price
	item.SupplierID = req.SupplierID

	// Validate supplier exists
	if _, err := ic.supplierRepo.FindByID(req.SupplierID); err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Supplier not found",
		})
	}

	if err := ic.itemRepo.Update(item); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update item",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Item updated successfully",
		"data":    item,
	})
}

// Delete deletes an item by ID
func (ic *ItemController) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid item ID",
		})
	}

	// Check if item exists
	_, err = ic.itemRepo.FindByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Item not found",
		})
	}

	if err := ic.itemRepo.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete item",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Item deleted successfully",
	})
}
