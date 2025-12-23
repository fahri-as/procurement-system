package models

import (
	"time"

	"github.com/shopspring/decimal"
)

// Purchasing represents a purchasing transaction
type Purchasing struct {
	ID         uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	Date       time.Time       `gorm:"type:datetime;not null;default:CURRENT_TIMESTAMP" json:"date"`
	SupplierID uint            `gorm:"not null;index" json:"supplierId"`
	UserID     uint            `gorm:"not null;index" json:"userId"`
	GrandTotal decimal.Decimal `gorm:"type:decimal(15,2);not null" json:"grandTotal"`
	
	// Relationships
	Supplier        Supplier          `gorm:"foreignKey:SupplierID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"supplier,omitempty"`
	User            User              `gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"user,omitempty"`
	PurchasingDetails []PurchasingDetail `gorm:"foreignKey:PurchasingID;constraint:OnDelete:CASCADE" json:"purchasingDetails,omitempty"`
}

