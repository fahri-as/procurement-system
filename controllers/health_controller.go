package controllers

import (
	"encoding/json"
	"net/http"
)

// HealthHandler returns a simple health check response.
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]string{
		"status": "ok",
		"uptime": "placeholder",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(resp)
}



