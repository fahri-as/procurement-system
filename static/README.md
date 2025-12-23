# Frontend Login Page

Halaman login untuk Procurement System menggunakan jQuery dan Tailwind CSS.

## Struktur File

```
static/
├── index.html          # Redirect ke login.html
├── login.html          # Halaman login utama
└── js/
    ├── config.js       # Konfigurasi API
    ├── auth.js         # Utility untuk autentikasi (token storage)
    └── login.js        # Logika form login
```

## Fitur

- ✅ Form login dengan validasi
- ✅ Integrasi dengan API `/api/login`
- ✅ Penyimpanan JWT token di localStorage
- ✅ Toggle visibility password
- ✅ Error handling yang user-friendly
- ✅ Loading state saat proses login
- ✅ Responsive design dengan Tailwind CSS
- ✅ Clean code structure dengan separation of concerns

## Cara Menggunakan

1. Pastikan server Go berjalan (default: `http://localhost:8080`)
2. Buka browser dan akses `http://localhost:8080/login.html`
3. Masukkan username dan password
4. Token JWT akan otomatis disimpan di localStorage
5. Setelah login berhasil, akan redirect ke `/dashboard.html` (sesuaikan path sesuai kebutuhan)

## Konfigurasi API

Edit file `js/config.js` untuk mengubah:
- Base URL API
- Timeout request
- Storage keys

## Token Storage

Token JWT disimpan di localStorage dengan key `procurement_token`.
User data disimpan dengan key `procurement_user`.

Untuk mengakses token di halaman lain:
```javascript
const token = Auth.getToken();
const user = Auth.getUser();
```

## Dependencies

- jQuery 3.7.1 (via CDN)
- Tailwind CSS (via CDN)

