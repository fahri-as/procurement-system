package repository

import (
	"procurement-system/config"
	"procurement-system/models"

	"gorm.io/gorm"
)

// PurchasingRepository handles purchasing transaction operations
type PurchasingRepository struct{}

// NewPurchasingRepository creates a new PurchasingRepository instance
func NewPurchasingRepository() *PurchasingRepository {
	return &PurchasingRepository{}
}

// CreatePurchasingTransaction creates a purchasing transaction with details and updates stock
// This function uses GORM transaction to ensure ACID properties:
// - Atomicity: All operations (Insert Header, Insert Details, Update Stock) succeed or all fail
// - Consistency: Database remains in a valid state
// - Isolation: Concurrent transactions don't interfere
// - Durability: Committed changes are permanent
// If any operation fails, the entire transaction is rolled back automatically
func (r *PurchasingRepository) CreatePurchasingTransaction(
	purchasing *models.Purchasing,
	details []models.PurchasingDetail,
	updateStockFn func(tx *gorm.DB, itemID uint, qty int) error,
) error {
	return config.DB.Transaction(func(tx *gorm.DB) error {
		// Step 1: Insert Purchasing Header
		// If this fails, transaction will rollback
		if err := tx.Create(purchasing).Error; err != nil {
			return err
		}

		// Step 2: Insert Purchasing Details and Update Stock for each detail
		// All operations must succeed, otherwise entire transaction rolls back
		for i := range details {
			details[i].PurchasingID = purchasing.ID
			
			// Insert detail record
			if err := tx.Create(&details[i]).Error; err != nil {
				return err // Rollback entire transaction
			}

			// Update item stock (increase stock when purchasing)
			// This uses the same transaction context to ensure atomicity
			if err := updateStockFn(tx, details[i].ItemID, details[i].Qty); err != nil {
				return err // Rollback entire transaction
			}
		}

		// If all operations succeed, transaction will commit automatically
		// Returning nil commits the transaction
		return nil
	})
}

