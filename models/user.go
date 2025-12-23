package models

// User represents a user account in the system
type User struct {
	ID       uint   `gorm:"primaryKey;autoIncrement" json:"id"`
	Username string `gorm:"type:varchar(50);not null;unique" json:"username"`
	Password string `gorm:"type:varchar(255);not null" json:"password"`
	Role     string `gorm:"type:varchar(20);not null" json:"role"`
}
