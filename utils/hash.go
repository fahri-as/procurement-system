package utils

import (
	"crypto/sha256"
	"encoding/hex"
)

// HashPassword returns a SHA-256 hash of the provided password.
// Replace with bcrypt or Argon2 for production use.
func HashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

// CheckPassword compares a plaintext password with an expected SHA-256 hash.
func CheckPassword(password string, expectedHash string) bool {
	return HashPassword(password) == expectedHash
}


