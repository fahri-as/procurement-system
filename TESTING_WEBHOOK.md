# Panduan Testing Webhook di Postman

## Langkah 1: Setup Webhook URL (Pilih salah satu)

### Opsi A: Menggunakan Webhook.site (Disarankan)

1. Buka https://webhook.site
2. Copy **Unique URL** yang diberikan (contoh: `https://webhook.site/abc123-def456-ghi789`)
3. URL ini akan menampilkan semua request yang diterima

### Opsi B: Menggunakan RequestBin

1. Buka https://requestbin.com
2. Klik **Create Request Bin**
3. Copy **Bin URL** (contoh: `https://requestbin.com/r/abc123def456`)

---

## Langkah 2: Login untuk Mendapatkan JWT Token

### Request di Postman:

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/login`
- **Headers**:
  ```
  Content-Type: application/json
  ```
- **Body** (raw JSON):
  ```json
  {
    "username": "admin",
    "password": "password123"
  }
  ```

### Response:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Copy token** dari response untuk digunakan di langkah berikutnya.

---

## Langkah 3: Pastikan Data Master Ada

### 3.1 Buat Supplier (jika belum ada)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/suppliers`
- **Headers**:
  ```
  Authorization: Bearer <TOKEN_DARI_LOGIN>
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "name": "PT Supplier ABC",
    "email": "supplier@example.com",
    "address": "Jl. Contoh No. 123"
  }
  ```
- **Catat Supplier ID** dari response

### 3.2 Buat Item (jika belum ada)

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/items`
- **Headers**:
  ```
  Authorization: Bearer <TOKEN_DARI_LOGIN>
  Content-Type: application/json
  ```
- **Body**:
  ```json
  {
    "name": "Laptop",
    "stock": 10,
    "price": 5000000.0
  }
  ```
- **Catat Item ID** dari response

---

## Langkah 4: Test Purchasing dengan Webhook

### Request di Postman:

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/purchasings`
- **Headers**:

  ```
  Authorization: Bearer <TOKEN_DARI_LOGIN>
  Content-Type: application/json
  X-Webhook-URL: https://webhook.site/abc123-def456-ghi789
  ```

  ⚠️ **PENTING**: Ganti `https://webhook.site/abc123-def456-ghi789` dengan URL webhook Anda!

- **Body** (raw JSON):
  ```json
  {
    "supplierId": 1,
    "details": [
      {
        "itemId": 1,
        "qty": 2
      },
      {
        "itemId": 2,
        "qty": 5
      }
    ]
  }
  ```

### Response yang Diharapkan:

```json
{
  "message": "Purchasing transaction created successfully",
  "purchasing": {
    "id": 1,
    "date": "2025-01-15T10:30:00Z",
    "supplierId": 1,
    "userId": 1,
    "grandTotal": "30000000.00",
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
      "qty": 2,
      "subTotal": "10000000.00",
      "item": {
        "id": 1,
        "name": "Laptop",
        "stock": 12,
        "price": "5000000.00"
      }
    }
  ]
}
```

---

## Langkah 5: Cek Webhook di Webhook.site

1. Buka tab **Webhook.site** di browser
2. Anda akan melihat **POST request** baru muncul
3. Klik request tersebut untuk melihat detail

### Format Webhook yang Diterima:

```json
{
  "event": "purchasing.created",
  "timestamp": "2025-01-15T10:30:00Z",
  "purchasing": {
    "id": 1,
    "date": "2025-01-15T10:30:00Z",
    "supplierId": 1,
    "userId": 1,
    "grandTotal": "30000000.00",
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
      "qty": 2,
      "subTotal": "10000000.00",
      "item": {
        "id": 1,
        "name": "Laptop",
        "stock": 12,
        "price": "5000000.00"
      }
    }
  ]
}
```

### Headers yang Dikirim:

```
Content-Type: application/json
User-Agent: Procurement-System/1.0
```

---

## Alternatif: Menggunakan Environment Variable

Jika tidak ingin mengirim webhook URL setiap request, Anda bisa set di environment variable:

### Di `.env` file:

```env
WEBHOOK_URL=https://webhook.site/abc123-def456-ghi789
```

Maka Anda tidak perlu menambahkan header `X-Webhook-URL` di Postman.

---

## Troubleshooting

### ❌ Error 404 "Cannot POST /api/suppliers" atau "Cannot POST /api/items"

**Penyebab:**

- Endpoint `/api/suppliers` dan `/api/items` adalah **protected routes** yang memerlukan JWT token
- Jika token tidak ada atau tidak valid, request akan di-reject oleh middleware sebelum sampai ke handler

**Solusi:**

1. ✅ **Pastikan Anda sudah login** dan mendapatkan JWT token
2. ✅ **Tambahkan Authorization header** di Postman:
   ```
   Authorization: Bearer <TOKEN_DARI_LOGIN>
   ```
   ⚠️ **PENTING**: Harus ada spasi antara `Bearer` dan token!
3. ✅ **Pastikan server berjalan** di `http://localhost:8080`
4. ✅ **Cek format token**: Token harus lengkap (biasanya panjang, dimulai dengan `eyJ...`)

**Cara Test:**

1. Test endpoint `/api/health` dulu dengan token:
   ```
   GET http://localhost:8080/api/health
   Headers: Authorization: Bearer <TOKEN>
   ```
   Jika ini berhasil (status 200), berarti token valid dan bisa lanjut ke create supplier/item.

### ❌ Error 401 "Unauthorized" atau "Invalid token"

**Penyebab:**

- Token JWT tidak valid, expired, atau format salah

**Solusi:**

1. ✅ Login ulang untuk mendapatkan token baru
2. ✅ Pastikan format header: `Bearer <token>` (dengan spasi, tidak ada tanda kutip)
3. ✅ Token biasanya expired setelah 24 jam, login ulang jika perlu
4. ✅ Pastikan tidak ada karakter tambahan di token (copy-paste dengan hati-hati)

### ❌ Error "Supplier not found" atau "Item not found"

**Penyebab:**

- Supplier ID atau Item ID yang digunakan tidak ada di database

**Solusi:**

1. ✅ Gunakan endpoint GET untuk melihat data yang ada:
   ```
   GET http://localhost:8080/api/suppliers
   GET http://localhost:8080/api/items
   ```
   (Jangan lupa tambahkan Authorization header!)
2. ✅ Gunakan ID yang benar dari response GET
3. ✅ Atau buat supplier/item baru terlebih dahulu

### ❌ Webhook tidak terkirim?

1. ✅ Pastikan webhook URL valid dan dapat diakses
2. ✅ Cek log server untuk error webhook
3. ✅ Pastikan transaksi berhasil (status 201 Created)
4. ✅ Webhook dikirim secara async, tunggu beberapa detik
5. ✅ Pastikan webhook URL di header atau environment variable sudah benar

### ❌ Server tidak berjalan atau error saat start

**Cek:**

1. ✅ Database MySQL sudah berjalan
2. ✅ Database `procurement_system` sudah dibuat
3. ✅ Environment variable `DB_DSN` sudah benar (atau gunakan default)
4. ✅ Port 8080 tidak digunakan aplikasi lain

**Test koneksi database:**

```bash
mysql -u root -p -e "USE procurement_system; SHOW TABLES;"
```

---

## Contoh Collection Postman

Anda bisa membuat collection dengan urutan berikut:

1. **Login** - POST `/api/login`
2. **Create Supplier** - POST `/api/suppliers` (dengan token)
3. **Create Item** - POST `/api/items` (dengan token)
4. **Create Purchasing** - POST `/api/purchasings` (dengan token + webhook header)

Set token sebagai **Collection Variable** agar bisa digunakan di semua request.
