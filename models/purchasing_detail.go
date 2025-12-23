package models

import "github.com/shopspring/decimal"

// PurchasingDetail represents a detail line item in a purchasing transaction
type PurchasingDetail struct {
	ID           uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	PurchasingID uint            `gorm:"not null;index" json:"purchasingId"`
	ItemID       uint            `gorm:"not null;index" json:"itemId"`
	Qty          int             `gorm:"not null" json:"qty"`
	SubTotal     decimal.Decimal `gorm:"type:decimal(15,2);not null" json:"subTotal"`
	
	// Relationships
	Purchasing Purchasing `gorm:"foreignKey:PurchasingID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE" json:"purchasing,omitempty"`
	Item       Item       `gorm:"foreignKey:ItemID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT" json:"item,omitempty"`
}

