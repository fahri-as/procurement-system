package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"procurement-system/models"
)

// WebhookPayload represents the data structure sent to webhook
type WebhookPayload struct {
	Event      string                      `json:"event"`
	Timestamp  string                      `json:"timestamp"`
	Purchasing models.Purchasing           `json:"purchasing"`
	Details    []models.PurchasingDetail   `json:"details"`
}

// SendWebhook sends purchasing transaction data to external webhook URL
// This function is called after successful database commit
func SendWebhook(webhookURL string, purchasing *models.Purchasing, details []models.PurchasingDetail) error {
	payload := WebhookPayload{
		Event:     "purchasing.created",
		Timestamp: time.Now().Format(time.RFC3339),
		Purchasing: *purchasing,
		Details:    details,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal webhook payload: %w", err)
	}

	// Create HTTP request
	req, err := http.NewRequest("POST", webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		return fmt.Errorf("failed to create webhook request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "Procurement-System/1.0")

	// Create HTTP client with timeout
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Send request
	resp, err := client.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send webhook request: %w", err)
	}
	defer resp.Body.Close()

	// Log the response (non-blocking)
	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		log.Printf("Webhook sent successfully to %s (Status: %d)", webhookURL, resp.StatusCode)
	} else {
		log.Printf("Webhook returned non-success status: %d for URL: %s", resp.StatusCode, webhookURL)
	}

	return nil
}


