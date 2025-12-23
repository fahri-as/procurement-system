# Debug Error 404 "Cannot POST /api/suppliers"

## Masalah yang Terjadi
Error 404 biasanya terjadi karena:
1. **Token yang digunakan bukan JWT token yang benar**
2. **Server tidak berjalan**
3. **Route tidak terdaftar dengan benar**

## Langkah Debugging

### 1. Pastikan Token JWT Benar

**JWT token yang benar:**
- Panjang (biasanya 100+ karakter)
- Dimulai dengan `eyJ` (base64 encoded JSON)
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzM3MDk2MDAwfQ.xxxxx`

**Token yang SALAH:**
- Pendek (seperti `9LUaTX9SLDXExgKN9NqmGbGeale4`)
- Bukan format JWT

### 2. Test Login Ulang

**Request di Postman:**
```
POST http://localhost:8080/api/login
Headers:
  Content-Type: application/json

Body:
{
  "username": "admin",
  "password": "password123"
}
```

**Response yang Diharapkan:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzM3MDk2MDAwfQ.xxxxx",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**⚠️ PENTING:** Copy token dari field `"token"` di response, bukan dari field lain!

### 3. Test Endpoint Health Dulu

Sebelum test create supplier, test endpoint `/api/health` untuk memastikan token valid:

**Request di Postman:**
```
GET http://localhost:8080/api/health
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzM3MDk2MDAwfQ.xxxxx
```

**Response yang Diharapkan (Status 200):**
```json
{
  "status": "ok",
  "userID": 1
}
```

Jika ini berhasil, berarti token valid dan bisa lanjut ke create supplier.

### 4. Test Create Supplier

**Request di Postman:**
```
POST http://localhost:8080/api/suppliers
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzM3MDk2MDAwfQ.xxxxx
  Content-Type: application/json

Body (raw JSON):
{
  "name": "PT Supplier ABC",
  "email": "supplier@example.com",
  "address": "Jl. Contoh No. 123"
}
```

## Checklist di Postman

- [ ] Sudah login dan dapat response dengan field `"token"`
- [ ] Token yang digunakan panjang (100+ karakter) dan dimulai dengan `eyJ`
- [ ] Header `Authorization` menggunakan format: `Bearer <token>` (dengan spasi)
- [ ] Header `Content-Type` di-set ke `application/json`
- [ ] Endpoint `/api/health` berhasil dengan token yang sama
- [ ] Server berjalan di `http://localhost:8080`

## Cara Copy Token di Postman

1. Setelah login, lihat response di tab **Body**
2. Copy **seluruh** value dari field `"token"` (termasuk tanda kutip jika ada)
3. Paste ke field Token di tab Authorization
4. Pastikan format: `Bearer <spasi><token>` (Postman biasanya otomatis menambahkan "Bearer ")

## Jika Masih Error 404

### Cek Server Berjalan
```bash
# Di terminal, jalankan:
cd d:\kuliah\Kerja\Codingan\Golang\procurement-system
go run main.go
```

Pastikan output menunjukkan:
```
Database connected successfully
Server starting on :8080
```

### Cek Route Terdaftar
Jika server berjalan, coba test endpoint lain:
- `GET http://localhost:8080/api/health` (dengan token)
- `GET http://localhost:8080/api/suppliers` (dengan token)

Jika semua endpoint mengembalikan 404, kemungkinan ada masalah dengan route registration.

## Error Messages yang Mungkin Muncul

### 401 Unauthorized - "Authorization header is required"
→ Token tidak ada di header

### 401 Unauthorized - "Invalid authorization header format"
→ Format header salah, harus: `Bearer <token>`

### 401 Unauthorized - "Invalid or expired token"
→ Token tidak valid atau sudah expired (login ulang)

### 404 Not Found - "Cannot POST /api/suppliers"
→ Route tidak ditemukan (kemungkinan token tidak valid atau server tidak berjalan dengan benar)

