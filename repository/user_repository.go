package repository

import (
	"context"

	"procurement-system/models"
)

// UserRepository shows the expected operations to store and retrieve users.
// Replace with a concrete implementation (e.g., using GORM).
type UserRepository interface {
	FindByEmail(ctx context.Context, email string) (*models.User, error)
	Save(ctx context.Context, user *models.User) error
}


