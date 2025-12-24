package models

// Supplier represents a supplier/vendor in the system
type Supplier struct {
	ID      uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Name    string `gorm:"type:varchar(100);not null" json:"name"`
	Email   string `gorm:"type:varchar(100);not null" json:"email"`
	Address string `gorm:"type:text" json:"address"`
	Items   []Item `gorm:"foreignKey:SupplierID" json:"items,omitempty"`
}
