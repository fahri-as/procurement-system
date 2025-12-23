package models

import "github.com/shopspring/decimal"

// Item represents a product/item in the inventory
type Item struct {
	ID    uint            `gorm:"primaryKey;autoIncrement" json:"id"`
	Name  string          `gorm:"type:varchar(100);not null" json:"name"`
	Stock int             `gorm:"not null;default:0" json:"stock"`
	Price decimal.Decimal `gorm:"type:decimal(15,2);not null" json:"price"`
}

