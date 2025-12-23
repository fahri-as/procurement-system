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

// LoadEnv loads environment variables from .env file
func LoadEnv() {
	if err := godotenv.Load("env"); err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	JWTSecret = os.Getenv("JWT_SECRET")
	if JWTSecret == "" {
		JWTSecret = "changeme" // fallback to default
		log.Println("Warning: JWT_SECRET not set, using default value")
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


