# Webhook Documentation

## Overview

Setelah transaksi purchasing berhasil di-commit ke database, sistem akan mengirim notifikasi webhook ke URL eksternal (jika dikonfigurasi).

## Konfigurasi Webhook URL

Webhook URL dapat dikonfigurasi melalui 2 cara:

1. **Environment Variable** (disarankan):

   ```bash
   WEBHOOK_URL=https://your-webhook-server.com/api/purchasing
   ```

2. **HTTP Header** (per request):
   ```
   X-Webhook-URL: https://your-webhook-server.com/api/purchasing
   ```

## Format JSON Request

Sistem akan mengirim POST request dengan format JSON berikut:

### Headers

```
Content-Type: application/json
User-Agent: Procurement-System/1.0
```

### Body Structure

```json
{
  "event": "purchasing.created",
  "timestamp": "2025-12-23T22:00:00Z",
  "purchasing": {
    "id": 1,
    "date": "2025-12-23T22:00:00Z",
    "supplierId": 1,
    "userId": 1,
    "grandTotal": "150000.00",
    "supplier": {
      "id": 1,
      "name": "PT Supplier ABC",
      "email": "supplier@example.com",
      "address": "Jl. Contoh No. 123"
    },
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin"
    }
  },
  "details": [
    {
      "id": 1,
      "purchasingId": 1,
      "itemId": 1,
      "qty": 10,
      "subTotal": "100000.00",
      "item": {
        "id": 1,
        "name": "Item A",
        "stock": 50,
        "price": "10000.00"
      }
    },
    {
      "id": 2,
      "purchasingId": 1,
      "itemId": 2,
      "qty": 5,
      "subTotal": "50000.00",
      "item": {
        "id": 2,
        "name": "Item B",
        "stock": 25,
        "price": "10000.00"
      }
    }
  ]
}
```

## Contoh Lengkap

### Request dari Procurement System

**POST** `https://your-webhook-server.com/api/purchasing`

**Headers:**

```
Content-Type: application/json
User-Agent: Procurement-System/1.0
```

**Body:**

```json
{
  "event": "purchasing.created",
  "timestamp": "2025-12-23T22:30:15Z",
  "purchasing": {
    "id": 42,
    "date": "2025-12-23T22:30:15Z",
    "supplierId": 5,
    "userId": 3,
    "grandTotal": "325000.00",
    "supplier": {
      "id": 5,
      "name": "PT Makmur Jaya",
      "email": "contact@makmurjaya.com",
      "address": "Jl. Industri Raya No. 45, Jakarta"
    },
    "user": {
      "id": 3,
      "username": "staff01",
      "role": "staff"
    }
  },
  "details": [
    {
      "id": 101,
      "purchasingId": 42,
      "itemId": 10,
      "qty": 20,
      "subTotal": "200000.00",
      "item": {
        "id": 10,
        "name": "Baut M8",
        "stock": 150,
        "price": "10000.00"
      }
    },
    {
      "id": 102,
      "purchasingId": 42,
      "itemId": 15,
      "qty": 25,
      "subTotal": "125000.00",
      "item": {
        "id": 15,
        "name": "Mur M8",
        "stock": 200,
        "price": "5000.00"
      }
    }
  ]
}
```

## Response yang Diharapkan

Webhook server sebaiknya mengembalikan response HTTP status code:

- **200-299**: Success (akan di-log sebagai sukses)
- **Lainnya**: Akan di-log sebagai warning, tapi tidak akan mempengaruhi transaksi

Contoh response yang baik:

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "received",
  "message": "Webhook processed successfully"
}
```

## Karakteristik

1. **Non-blocking**: Webhook dikirim secara asinkron setelah commit sukses, sehingga tidak memblokir response ke client
2. **Timeout**: 10 detik untuk setiap request webhook
3. **Fire and Forget**: Jika webhook gagal, transaksi tetap sukses (tidak di-rollback)
4. **Error Logging**: Error webhook akan di-log tetapi tidak mempengaruhi response ke client

## Implementasi Server-side Example (Go)

```go
func WebhookHandler(w http.ResponseWriter, r *http.Request) {
    var payload WebhookPayload

    if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    // Process the purchasing data
    log.Printf("Received purchasing event: %s", payload.Event)
    log.Printf("Purchasing ID: %d, Grand Total: %s",
        payload.Purchasing.ID, payload.Purchasing.GrandTotal)

    // Your business logic here...

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status": "received",
    })
}
```

## Testing dengan ngrok (Development)

Untuk testing webhook di local development:

1. Install ngrok: https://ngrok.com/
2. Jalankan webhook server lokal di port 3000
3. Expose dengan ngrok:
   ```bash
   ngrok http 3000
   ```
4. Gunakan URL ngrok sebagai WEBHOOK_URL:
   ```bash
   WEBHOOK_URL=https://abc123.ngrok.io/api/webhook
   ```
