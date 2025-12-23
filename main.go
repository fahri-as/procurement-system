package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"procurement-system/config"
	"procurement-system/models"
	"procurement-system/routes"
)

func main() {
	// Load environment variables
	config.LoadEnv()

	// Initialize database
	if err := config.InitDB(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto migrate models
	if err := autoMigrate(); err != nil {
		log.Fatalf("Failed to auto migrate: %v", err)
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(logger.New())

	// Register routes
	routes.RegisterRoutes(app, config.DB)

	// 404 handler
	app.Use(func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Cannot " + c.Method() + " " + c.Path(),
		})
	})

	// Get server address
	addr := getServerAddr()
	log.Printf("Server starting on %s\n", addr)

	// Start server
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Server stopped: %v", err)
	}
}

func getServerAddr() string {
	if port := os.Getenv("PORT"); port != "" {
		return ":" + port
	}
	return ":" + config.DefaultPort
}

func autoMigrate() error {
	return config.DB.AutoMigrate(
		&models.User{},
		&models.Item{},
		&models.Supplier{},
		&models.Purchasing{},
		&models.PurchasingDetail{},
	)
}


