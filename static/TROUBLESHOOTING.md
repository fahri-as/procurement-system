# Troubleshooting Login Issues

## Masalah: Tidak bisa login di web, padahal bisa di Postman

### Langkah Debugging:

1. **Buka Browser Console (F12)**
   - Lihat apakah ada error di Console tab
   - Periksa Network tab untuk melihat request yang dikirim

2. **Periksa URL API**
   - Pastikan URL yang digunakan benar: `http://localhost:8080/api/login`
   - Di browser console, cek log: `Login attempt: { url: ..., username: ... }`

3. **Periksa Request di Network Tab**
   - Buka Developer Tools > Network
   - Coba login lagi
   - Klik pada request ke `/api/login`
   - Periksa:
     - **Request URL**: Harus `http://localhost:8080/api/login`
     - **Request Method**: Harus `POST`
     - **Request Headers**: Harus ada `Content-Type: application/json`
     - **Request Payload**: Harus berisi `{"username":"...","password":"..."}`
     - **Response Status**: Periksa status code (200, 401, 400, 500, dll)
     - **Response Body**: Lihat apa yang dikembalikan server

4. **Periksa Server Logs**
   - Lihat terminal dimana server Go berjalan
   - Pastikan request sampai ke server
   - Periksa apakah ada error di server

5. **Common Issues:**

   **a. CORS Error**
   - Error: `Access to XMLHttpRequest blocked by CORS policy`
   - Solusi: Pastikan CORS middleware sudah ditambahkan di `main.go`

   **b. 404 Not Found**
   - Error: `Cannot POST /api/login`
   - Solusi: 
     - Pastikan server berjalan di port yang benar (default: 8080)
     - Pastikan route `/api/login` sudah terdaftar
     - Restart server Go

   **c. 401 Unauthorized**
   - Error: `Username atau password salah`
   - Solusi:
     - Pastikan username dan password benar
     - Periksa apakah user sudah terdaftar di database
     - Coba login dengan Postman untuk verifikasi

   **d. 500 Internal Server Error**
   - Error: `Kesalahan server`
   - Solusi:
     - Periksa server logs untuk detail error
     - Pastikan database terhubung
     - Pastikan JWT_SECRET sudah di-set

   **e. Network Error / Timeout**
   - Error: `Tidak dapat terhubung ke server`
   - Solusi:
     - Pastikan server Go berjalan
     - Periksa firewall/antivirus
     - Coba akses `http://localhost:8080/api/health` di browser

6. **Test dengan curl (alternatif Postman):**
   ```bash
   curl -X POST http://localhost:8080/api/login \
     -H "Content-Type: application/json" \
     -d '{"username":"your_username","password":"your_password"}'
   ```

7. **Periksa localStorage:**
   - Buka Browser Console
   - Ketik: `localStorage.getItem('procurement_token')`
   - Jika ada token, berarti login sebelumnya berhasil
   - Clear localStorage: `localStorage.clear()`

## Debugging Steps di Browser Console:

1. Buka halaman login
2. Tekan F12 untuk buka Developer Tools
3. Buka tab Console
4. Coba login
5. Periksa log yang muncul:
   - `Login attempt: { url: ..., username: ... }` - menunjukkan request yang dikirim
   - `Login success response: {...}` - menunjukkan response sukses
   - `Login error: {...}` - menunjukkan error detail

## Format Request yang Benar:

```json
POST http://localhost:8080/api/login
Headers:
  Content-Type: application/json
Body:
{
  "username": "your_username",
  "password": "your_password"
}
```

## Format Response yang Diharapkan:

```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "your_username",
    "role": "admin"
  }
}
```

## Jika Masih Bermasalah:

1. Pastikan semua file JavaScript sudah ter-load:
   - `config.js`
   - `auth.js`
   - `login.js`

2. Periksa apakah jQuery sudah ter-load:
   - Di console ketik: `typeof $` atau `typeof jQuery`
   - Harus mengembalikan `"function"`

3. Clear cache browser:
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)
   - Pilih "Cached images and files"

4. Restart server Go:
   ```bash
   # Stop server (Ctrl+C)
   go run main.go
   ```

