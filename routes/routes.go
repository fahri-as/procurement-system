package routes

import (
	"procurement-system/controllers"
	"procurement-system/middleware"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm" // Pastikan import gorm ditambahkan
)

// Tambahkan parameter db *gorm.DB di sini
func RegisterRoutes(app *fiber.App, db *gorm.DB) {
    
    // Inisialisasi controllers
    userController := controllers.NewUserController()
    purchasingController := controllers.NewPurchasingController()
    itemController := controllers.NewItemController(db)
    supplierController := controllers.NewSupplierController(db)

    // 1. Root Group
    api := app.Group("/api")

    // 2. Public Routes (Register & Login)
    api.Post("/register", userController.Register)
    api.Post("/login", userController.Login)

    // 3. Protected Routes (Memerlukan JWT)
    protected := api.Group("/", middleware.JWTAuth)

    // Health check
    protected.Get("/health", func(c *fiber.Ctx) error {
        return c.JSON(fiber.Map{
            "status": "ok", 
            "userID": c.Locals("userID"),
        })
    })

    // --- Master Data Endpoints (CRUD Items & Suppliers) ---
    items := protected.Group("/items")
    items.Get("/", itemController.GetAll)
    items.Post("/", itemController.Create)
    items.Put("/:id", itemController.Update)
    items.Delete("/:id", itemController.Delete)

    suppliers := protected.Group("/suppliers")
    suppliers.Get("/", supplierController.GetAll)
    suppliers.Post("/", supplierController.Create)
    suppliers.Put("/:id", supplierController.Update)
    suppliers.Delete("/:id", supplierController.Delete)

    // --- Purchasing Transaction ---
    protected.Post("/purchasings", purchasingController.Create)
}