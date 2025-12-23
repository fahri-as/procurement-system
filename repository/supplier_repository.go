package repository

import (
	"procurement-system/config"
	"procurement-system/models"
)

// SupplierRepository handles supplier data operations
type SupplierRepository struct{}

// NewSupplierRepository creates a new SupplierRepository instance
func NewSupplierRepository() *SupplierRepository {
	return &SupplierRepository{}
}

// FindByID finds a supplier by ID
func (r *SupplierRepository) FindByID(id uint) (*models.Supplier, error) {
	var supplier models.Supplier
	result := config.DB.First(&supplier, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &supplier, nil
}

// GetAll retrieves all suppliers
func (r *SupplierRepository) GetAll() ([]models.Supplier, error) {
	var suppliers []models.Supplier
	result := config.DB.Find(&suppliers)
	return suppliers, result.Error
}

// Create creates a new supplier
func (r *SupplierRepository) Create(supplier *models.Supplier) error {
	result := config.DB.Create(supplier)
	return result.Error
}

// Update updates an existing supplier
func (r *SupplierRepository) Update(supplier *models.Supplier) error {
	result := config.DB.Save(supplier)
	return result.Error
}

// Delete deletes a supplier by ID
func (r *SupplierRepository) Delete(id uint) error {
	result := config.DB.Delete(&models.Supplier{}, id)
	return result.Error
}

