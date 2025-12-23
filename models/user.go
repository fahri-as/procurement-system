package models

import "time"

// User represents a simple account entity.
type User struct {
	ID           uint
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}


