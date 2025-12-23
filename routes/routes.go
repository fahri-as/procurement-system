package routes

import (
	"net/http"

	"procurement-system/controllers"
	"procurement-system/middleware"
)

// RegisterRoutes wires the HTTP endpoints to the provided mux.
func RegisterRoutes(mux *http.ServeMux) {
	mux.Handle("/health", middleware.Logging(http.HandlerFunc(controllers.HealthHandler)))
}


