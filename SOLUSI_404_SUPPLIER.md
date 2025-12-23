# Solusi Error 404 "Cannot POST /api/suppliers"

## Token Anda Sudah Benar ✅
Token yang Anda gunakan sudah benar:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjY2MDI2MDEsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoiam9obl9kb2UifQ.BA1GXMFDJEmk34l9LUaTX9SLDXExgKN9NqmGbGeaIe4
```

## Langkah Debugging

### 1. Pastikan Server Berjalan

**Buka terminal baru dan jalankan:**
```bash
cd d:\kuliah\Kerja\Codingan\Golang\procurement-system
go run main.go
```

**Output yang Diharapkan:**
```
Database connected successfully
Server starting on :8080
```

Jika ada error, perbaiki dulu sebelum lanjut.

### 2. Test Endpoint Health Dulu

**Di Postman, buat request baru:**
```
GET http://localhost:8080/api/health
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjY2MDI2MDEsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoiam9obl9kb2UifQ.BA1GXMFDJEmk34l9LUaTX9SLDXExgKN9NqmGbGeaIe4
```

**Response yang Diharapkan (Status 200):**
```json
{
  "status": "ok",
  "userID": 1
}
```

**Jika ini berhasil**, berarti:
- ✅ Server berjalan
- ✅ Token valid
- ✅ Middleware JWT bekerja
- ✅ Route terdaftar dengan benar

**Jika ini gagal dengan error 401**, berarti token tidak valid atau expired. Login ulang.

**Jika ini gagal dengan error 404**, berarti server tidak berjalan atau ada masalah dengan route registration.

### 3. Test Create Supplier

**Setelah endpoint `/api/health` berhasil**, baru test create supplier:

**Request di Postman:**
```
POST http://localhost:8080/api/suppliers
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjY2MDI2MDEsInJvbGUiOiJhZG1pbiIsInVzZXJfaWQiOjEsInVzZXJuYW1lIjoiam9obl9kb2UifQ.BA1GXMFDJEmk34l9LUaTX9SLDXExgKN9NqmGbGeaIe4
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "name": "PT Supplier ABC",
  "email": "supplier@example.com",
  "address": "Jl. Contoh No. 123"
}
```

**Response yang Diharapkan (Status 201):**
```json
{
  "message": "Supplier created successfully",
  "data": {
    "id": 1,
    "name": "PT Supplier ABC",
    "email": "supplier@example.com",
    "address": "Jl. Contoh No. 123"
  }
}
```

## Troubleshooting Berdasarkan Error

### Error 401 "Authorization header is required"
→ Token tidak ada di header. Pastikan header `Authorization` sudah ditambahkan.

### Error 401 "Invalid authorization header format"
→ Format header salah. Harus: `Bearer <token>` (dengan spasi).

### Error 401 "Invalid or expired token"
→ Token tidak valid atau expired. Login ulang untuk mendapatkan token baru.

### Error 404 "Cannot POST /api/suppliers"
→ **Kemungkinan penyebab:**
1. Server tidak berjalan → Jalankan `go run main.go`
2. Route tidak terdaftar → Restart server setelah perubahan code
3. Port salah → Pastikan server berjalan di port 8080

### Error 500 "Internal Server Error"
→ Ada masalah di server. Cek log di terminal untuk detail error.

## Checklist

- [ ] Server berjalan di terminal (lihat output "Server starting on :8080")
- [ ] Endpoint `/api/health` berhasil dengan token yang sama
- [ ] Header `Authorization` menggunakan format: `Bearer <token>`
- [ ] Header `Content-Type` di-set ke `application/json`
- [ ] Body request dalam format JSON yang benar
- [ ] Tidak ada error di terminal server

## Tips

1. **Selalu test endpoint `/api/health` dulu** sebelum test endpoint lain
2. **Jika ada perubahan code**, restart server dengan `Ctrl+C` lalu `go run main.go` lagi
3. **Cek log di terminal** untuk melihat request yang masuk dan error yang terjadi
4. **Gunakan token yang sama** untuk semua request dalam satu session

