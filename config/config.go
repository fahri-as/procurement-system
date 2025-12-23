package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// DefaultPort is used when PORT is not provided in the environment.
const DefaultPort = "8080"

var DB *gorm.DB
var JWTSecret string
var WebhookURL string

// LoadEnv loads environment variables from .env file
func LoadEnv() {
	// Try loading from .env first (standard), then try "env" as fallback
	if err := godotenv.Load(".env"); err != nil {
		if err2 := godotenv.Load("env"); err2 != nil {
			log.Println("Warning: .env or env file not found, using system environment variables")
		}
	}

	JWTSecret = os.Getenv("JWT_SECRET")
	if JWTSecret == "" {
		JWTSecret = "changeme" // fallback to default
		log.Println("Warning: JWT_SECRET not set, using default value")
	}

	WebhookURL = os.Getenv("WEBHOOK_URL")
	if WebhookURL != "" {
		log.Printf("Webhook URL loaded from environment: %s", WebhookURL)
	}
}

// InitDB initializes the database connection using GORM
func InitDB() error {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "root:@tcp(localhost:3306)/procurement_system?parseTime=true"
	}

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		return err
	}

	log.Println("Database connected successfully")
	return nil
}


