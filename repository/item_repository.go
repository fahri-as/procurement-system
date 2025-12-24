package repository

import (
	"procurement-system/config"
	"procurement-system/models"

	"gorm.io/gorm"
)

// ItemRepository handles item data operations
type ItemRepository struct{}

// NewItemRepository creates a new ItemRepository instance
func NewItemRepository() *ItemRepository {
	return &ItemRepository{}
}

// FindByID finds an item by ID
func (r *ItemRepository) FindByID(id uint) (*models.Item, error) {
	var item models.Item
	result := config.DB.Preload("Supplier").First(&item, id)
	if result.Error != nil {
		return nil, result.Error
	}
	return &item, nil
}

// UpdateStockWithTx updates stock using the provided transaction
func (r *ItemRepository) UpdateStockWithTx(tx *gorm.DB, itemID uint, qty int) error {
	result := tx.Model(&models.Item{}).Where("id = ?", itemID).Update("stock", gorm.Expr("stock + ?", qty))
	return result.Error
}

// GetAll retrieves all items
func (r *ItemRepository) GetAll() ([]models.Item, error) {
	var items []models.Item
	result := config.DB.Preload("Supplier").Find(&items)
	return items, result.Error
}

// GetAllBySupplier retrieves items for a specific supplier
func (r *ItemRepository) GetAllBySupplier(supplierID uint) ([]models.Item, error) {
	var items []models.Item
	result := config.DB.Preload("Supplier").Where("supplier_id = ?", supplierID).Find(&items)
	return items, result.Error
}

// Create creates a new item
func (r *ItemRepository) Create(item *models.Item) error {
	result := config.DB.Create(item)
	return result.Error
}

// Update updates an existing item
func (r *ItemRepository) Update(item *models.Item) error {
	result := config.DB.Save(item)
	return result.Error
}

// Delete deletes an item by ID
func (r *ItemRepository) Delete(id uint) error {
	result := config.DB.Delete(&models.Item{}, id)
	return result.Error
}
