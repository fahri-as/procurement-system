package controllers

import (
	"strconv"

	"procurement-system/models"
	"procurement-system/repository"

	"github.com/gofiber/fiber/v2"
)

// SupplierController handles supplier-related HTTP requests
type SupplierController struct {
	supplierRepo *repository.SupplierRepository
}

// NewSupplierController creates a new SupplierController instance
func NewSupplierController(db interface{}) *SupplierController {
	return &SupplierController{
		supplierRepo: repository.NewSupplierRepository(),
	}
}

// CreateSupplierRequest represents the request body for creating a supplier
type CreateSupplierRequest struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Address string `json:"address"`
}

// UpdateSupplierRequest represents the request body for updating a supplier
type UpdateSupplierRequest struct {
	Name    string `json:"name" validate:"required"`
	Email   string `json:"email" validate:"required,email"`
	Address string `json:"address"`
}

// GetAll retrieves all suppliers
func (sc *SupplierController) GetAll(c *fiber.Ctx) error {
	suppliers, err := sc.supplierRepo.GetAll()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve suppliers",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Suppliers retrieved successfully",
		"data":    suppliers,
	})
}

// Create creates a new supplier
func (sc *SupplierController) Create(c *fiber.Ctx) error {
	var req CreateSupplierRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	supplier := models.Supplier{
		Name:    req.Name,
		Email:   req.Email,
		Address: req.Address,
	}

	if err := sc.supplierRepo.Create(&supplier); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create supplier",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Supplier created successfully",
		"data":    supplier,
	})
}

// Update updates an existing supplier
func (sc *SupplierController) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid supplier ID",
		})
	}

	// Check if supplier exists
	supplier, err := sc.supplierRepo.FindByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Supplier not found",
		})
	}

	var req UpdateSupplierRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	supplier.Name = req.Name
	supplier.Email = req.Email
	supplier.Address = req.Address

	if err := sc.supplierRepo.Update(supplier); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update supplier",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Supplier updated successfully",
		"data":    supplier,
	})
}

// Delete deletes a supplier by ID
func (sc *SupplierController) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid supplier ID",
		})
	}

	// Check if supplier exists
	_, err = sc.supplierRepo.FindByID(uint(id))
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Supplier not found",
		})
	}

	if err := sc.supplierRepo.Delete(uint(id)); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete supplier",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Supplier deleted successfully",
	})
}