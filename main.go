package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"procurement-system/config"
	"procurement-system/routes"
)

func main() {
	// Load environment variables or configuration from .env or other sources.
	config.LoadEnv()

	mux := http.NewServeMux()
	routes.RegisterRoutes(mux)

	addr := getServerAddr()
	fmt.Printf("server starting on %s\n", addr)

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func getServerAddr() string {
	if port := os.Getenv("PORT"); port != "" {
		return ":" + port
	}
	return ":" + config.DefaultPort
}


