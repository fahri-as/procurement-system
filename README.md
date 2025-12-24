# 🛒 Procurement System

[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?style=for-the-badge&logo=go&logoColor=white)](https://go.dev/)
[![Fiber](https://img.shields.io/badge/Fiber-v2-00ACD7?style=for-the-badge&logo=go&logoColor=white)](https://gofiber.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

> Sistem manajemen pengadaan barang (*procurement*) berbasis web dengan REST API dan dashboard modern. Dibangun menggunakan Go (Fiber) untuk backend dan TailwindCSS untuk frontend.

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Prasyarat](#-prasyarat)
- [🚀 Panduan Instalasi](#-panduan-instalasi)
- [Konfigurasi](#-konfigurasi)
- [Cara Penggunaan](#-cara-penggunaan)
- [API Endpoints](#-api-endpoints)
- [Troubleshooting](#-troubleshooting)
- [Lisensi](#-lisensi)

---

## 📖 Tentang Proyek

**Procurement System** adalah aplikasi web untuk mengelola proses pengadaan barang dalam sebuah organisasi atau perusahaan. Sistem ini memungkinkan pengguna untuk:

- Mengelola data supplier dan barang (inventory)
- Membuat dan melacak purchase order
- Memonitor stok barang secara real-time
- Mengintegrasikan notifikasi melalui webhook

Aplikasi ini cocok digunakan untuk bisnis kecil hingga menengah yang membutuhkan sistem pengadaan barang yang terstruktur dan mudah digunakan.

---

## ✨ Fitur Utama

| Fitur                      | Deskripsi                                              |
| -------------------------- | ------------------------------------------------------ |
| 🔐 **Autentikasi JWT**     | Login aman dengan token JWT (berlaku 24 jam)           |
| 👥 **Manajemen Pengguna**  | Registrasi dengan role `admin` atau `staff`            |
| 📦 **Manajemen Inventory** | CRUD barang dengan tracking stok dan harga             |
| 🏢 **Manajemen Supplier**  | Kelola data supplier (nama, email, alamat)             |
| 🛍️ **Purchase Order**     | Buat transaksi pembelian dengan detail item            |
| 📊 **Dashboard**           | Tampilan ringkasan: total item, stok rendah, dan nilai |
| 🔔 **Webhook Integration** | Notifikasi otomatis ke sistem eksternal                |
| 📱 **Responsive UI**       | Antarmuka modern dengan TailwindCSS                    |

---

## 🛠 Teknologi yang Digunakan

### Backend
- **[Go](https://go.dev/)** `v1.24+` - Bahasa pemrograman utama
- **[Fiber v2](https://gofiber.io/)** - Web framework (mirip Express.js)
- **[GORM](https://gorm.io/)** - ORM untuk database
- **[JWT](https://github.com/golang-jwt/jwt)** - Autentikasi token
- **[GoDotEnv](https://github.com/joho/godotenv)** - Environment variables

### Database
- **[MySQL](https://www.mysql.com/)** / **[MariaDB](https://mariadb.org/)** - Database relasional

### Frontend
- **HTML5** - Struktur halaman
- **[TailwindCSS](https://tailwindcss.com/)** (CDN) - Styling
- **JavaScript (jQuery)** - Interaksi dan AJAX
- **[SweetAlert2](https://sweetalert2.github.io/)** - Notifikasi popup

---

## 📋 Prasyarat

Sebelum memulai instalasi, pastikan Anda sudah menginstall software berikut di komputer Anda:

| Software           | Versi Minimum | Link Download                                        |
| ------------------ | ------------- | ---------------------------------------------------- |
| **Go**             | `1.21+`       | [Download Go](https://go.dev/dl/)                    |
| **MySQL/MariaDB**  | `5.7+`/`10.4+`| [Download MySQL](https://dev.mysql.com/downloads/)   |
| **Git**            | Terbaru       | [Download Git](https://git-scm.com/downloads)        |

### Cara Mengecek Instalasi

Jalankan perintah ini di terminal untuk memastikan semua sudah terinstall:

```bash
# Cek versi Go
go version
# Output contoh: go version go1.24.0 windows/amd64

# Cek versi MySQL
mysql --version
# Output contoh: mysql  Ver 8.0.31 for Win64 on x86_64

# Cek versi Git
git --version
# Output contoh: git version 2.42.0.windows.1
```

> [!NOTE]
> Jika menggunakan XAMPP, MySQL/MariaDB sudah termasuk di dalamnya. Pastikan service MySQL sudah berjalan.

---

## 🚀 Panduan Instalasi

Ikuti langkah-langkah berikut secara berurutan untuk menjalankan aplikasi di komputer Anda.

### Langkah 1: Clone Repository

Buka terminal dan jalankan perintah berikut:

```bash
git clone https://github.com/username/procurement-system.git
```

Masuk ke direktori proyek:

```bash
cd procurement-system
```

### Langkah 2: Install Dependencies

Download semua package Go yang diperlukan:

```bash
go mod download
```

> [!TIP]
> Jika `go mod download` lambat, coba gunakan proxy Go:
> ```bash
> go env -w GOPROXY=https://proxy.golang.org,direct
> go mod download
> ```

Tunggu hingga proses selesai. Ini akan mendownload:
- Fiber (web framework)
- GORM (database ORM)
- JWT library
- Dan dependencies lainnya

### Langkah 3: Buat Database

#### Opsi A: Import dari File SQL (Direkomendasikan)

1. Buka aplikasi database client (phpMyAdmin, MySQL Workbench, atau DBeaver)
2. Buat database baru:

```sql
CREATE DATABASE procurement_system;
```

3. Import file `procurement_system.sql` yang ada di root folder proyek

**Atau melalui terminal:**

```bash
# Login ke MySQL
mysql -u root -p

# Buat database (di dalam MySQL shell)
CREATE DATABASE procurement_system;
EXIT;

# Import file SQL
mysql -u root -p procurement_system < procurement_system.sql
```

#### Opsi B: Biarkan GORM Auto-Migrate

Jika tidak ingin import file SQL, aplikasi akan otomatis membuat tabel saat pertama kali dijalankan (menggunakan fitur auto-migrate GORM).

### Langkah 4: Konfigurasi Environment

Salin file contoh environment:

```bash
# Windows (Command Prompt)
copy env.example .env

# Windows (PowerShell)
Copy-Item env.example .env

# Linux/macOS
cp env.example .env
```

Edit file `.env` dengan text editor favorit Anda (lihat bagian [Konfigurasi](#-konfigurasi) untuk detail).

### Langkah 5: Jalankan Aplikasi

```bash
go run main.go
```

Jika berhasil, Anda akan melihat output:

```
2025/12/24 18:00:00 Database connected successfully
2025/12/24 18:00:00 Server starting on :8080
```

### Langkah 6: Akses Aplikasi

Buka browser dan akses:

| Halaman   | URL                                |
| --------- | ---------------------------------- |
| Login     | http://localhost:8080/login.html   |
| Dashboard | http://localhost:8080/dashboard.html |

> [!IMPORTANT]
> Saat pertama kali menggunakan aplikasi, Anda perlu **mendaftar akun baru** terlebih dahulu melalui API Register.

---

## ⚙️ Konfigurasi

### File `.env`

Berikut adalah konfigurasi lengkap yang perlu disesuaikan:

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# Format DSN: user:password@tcp(host:port)/database?parseTime=true

# Untuk MySQL tanpa password (development)
DB_DSN=root:@tcp(localhost:3306)/procurement_system?parseTime=true

# Untuk MySQL dengan password
# DB_DSN=root:yourpassword@tcp(localhost:3306)/procurement_system?parseTime=true

# Untuk remote database
# DB_DSN=admin:secretpass@tcp(192.168.1.100:3306)/procurement_system?parseTime=true

# ============================================
# JWT CONFIGURATION
# ============================================
# Secret key untuk signing JWT token
# WAJIB diganti di production!
JWT_SECRET=your-super-secret-key-min-32-characters

# ============================================
# SERVER CONFIGURATION
# ============================================
# Port untuk menjalankan server (default: 8080)
PORT=8080

# ============================================
# WEBHOOK (OPSIONAL)
# ============================================
# URL untuk mengirim notifikasi saat ada purchase order baru
# Kosongkan jika tidak menggunakan webhook
WEBHOOK_URL=https://your-webhook-url.com/api/purchasing
```

### Penjelasan Konfigurasi

| Variable      | Wajib? | Deskripsi                                           |
| ------------- | ------ | --------------------------------------------------- |
| `DB_DSN`      | ✅     | Connection string ke database MySQL                 |
| `JWT_SECRET`  | ✅     | Secret key untuk JWT (min. 32 karakter)             |
| `PORT`        | ❌     | Port server (default: 8080)                         |
| `WEBHOOK_URL` | ❌     | URL webhook untuk notifikasi purchase order         |

> [!CAUTION]
> **Untuk Production:**
> - Jangan gunakan `JWT_SECRET=changeme`
> - Gunakan password database yang kuat
> - Simpan file `.env` dengan aman (jangan commit ke git)

---

## 📖 Cara Penggunaan

### 1. Registrasi Akun Baru

Gunakan API untuk mendaftar akun baru:

```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123",
    "role": "admin"
  }'
```

**Response sukses:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 2. Login

Akses halaman login di browser: http://localhost:8080/login.html

Atau melalui API:

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

**Response sukses:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

> [!NOTE]
> Simpan token yang diberikan. Token ini diperlukan untuk mengakses semua endpoint yang terproteksi.

### 3. Mengakses Dashboard

Setelah login berhasil, Anda akan diarahkan ke Dashboard. Dari sini Anda dapat:

- **Melihat ringkasan** (total items, low stock, stock value)
- **Navigasi ke halaman lain** melalui sidebar:
  - 📦 **Inventory** - Kelola barang
  - 🏢 **Suppliers** - Kelola supplier
  - 🛍️ **Create Purchase** - Buat purchase order

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint        | Deskripsi                | Auth |
| ------ | --------------- | ------------------------ | ---- |
| POST   | `/api/register` | Registrasi pengguna baru | ❌   |
| POST   | `/api/login`    | Login dan dapatkan token | ❌   |

### Items (Barang)

| Method | Endpoint         | Deskripsi             | Auth |
| ------ | ---------------- | --------------------- | ---- |
| GET    | `/api/items`     | Ambil semua barang    | ✅   |
| POST   | `/api/items`     | Tambah barang baru    | ✅   |
| PUT    | `/api/items/:id` | Update barang         | ✅   |
| DELETE | `/api/items/:id` | Hapus barang          | ✅   |

### Suppliers

| Method | Endpoint             | Deskripsi               | Auth |
| ------ | -------------------- | ----------------------- | ---- |
| GET    | `/api/suppliers`     | Ambil semua supplier    | ✅   |
| POST   | `/api/suppliers`     | Tambah supplier baru    | ✅   |
| PUT    | `/api/suppliers/:id` | Update supplier         | ✅   |
| DELETE | `/api/suppliers/:id` | Hapus supplier          | ✅   |

### Purchasing (Transaksi)

| Method | Endpoint           | Deskripsi                 | Auth |
| ------ | ------------------ | ------------------------- | ---- |
| POST   | `/api/purchasings` | Buat purchase order baru  | ✅   |

### Contoh Request dengan Authorization

```bash
# Ganti YOUR_TOKEN dengan token yang didapat dari login
curl -X GET http://localhost:8080/api/items \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Contoh Membuat Purchase Order

```bash
curl -X POST http://localhost:8080/api/purchasings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "supplier_id": 1,
    "details": [
      {
        "item_id": 1,
        "qty": 10
      },
      {
        "item_id": 2,
        "qty": 5
      }
    ]
  }'
```

---

## 🔧 Troubleshooting

### ❌ Error: "Failed to connect to database"

**Penyebab:** MySQL tidak berjalan atau konfigurasi salah.

**Solusi:**
1. Pastikan MySQL/MariaDB sudah berjalan:
   ```bash
   # Windows (XAMPP)
   # Buka XAMPP Control Panel dan Start MySQL
   
   # Cek service
   netstat -an | findstr 3306
   ```

2. Periksa konfigurasi `DB_DSN` di file `.env`
3. Pastikan database `procurement_system` sudah dibuat

### ❌ Error: "JWT_SECRET not set"

**Penyebab:** File `.env` tidak ditemukan atau variabel tidak di-set.

**Solusi:**
1. Pastikan file `.env` ada di root folder (bukan `env.example`)
2. Restart aplikasi setelah mengubah `.env`

### ❌ Error: "Cannot POST /api/..." atau "404 Not Found"

**Penyebab:** Routing tidak ditemukan atau server belum berjalan dengan benar.

**Solusi:**
1. Pastikan server sudah berjalan (`go run main.go`)
2. Periksa endpoint yang diakses (harus sesuai dengan dokumentasi API)
3. Pastikan method HTTP sudah benar (GET, POST, PUT, DELETE)

### ❌ Error: "go: command not found"

**Penyebab:** Go belum terinstall atau PATH tidak dikonfigurasi.

**Solusi:**
1. Download dan install Go dari https://go.dev/dl/
2. Restart terminal setelah instalasi
3. Periksa instalasi: `go version`

### ❌ Frontend Tidak Bisa Mengakses API

**Penyebab:** CORS atau server tidak berjalan.

**Solusi:**
1. Pastikan server berjalan di port yang benar
2. Akses frontend melalui `http://localhost:8080/` (bukan file langsung)
3. CORS sudah diaktifkan secara default untuk development

---

## 📁 Struktur Proyek

```
procurement-system/
├── config/
│   └── config.go          # Konfigurasi database & environment
├── controllers/
│   ├── health_controller.go
│   ├── item_controller.go
│   ├── purchasing_controller.go
│   ├── supplier_controller.go
│   └── user_controller.go
├── middleware/
│   └── ...                 # JWT middleware
├── models/
│   ├── item.go
│   ├── purchasing.go
│   ├── purchasing_detail.go
│   ├── supplier.go
│   └── user.go
├── repository/
│   └── ...                 # Database operations
├── routes/
│   └── routes.go           # API routing
├── static/
│   ├── css/
│   ├── js/
│   ├── dashboard.html
│   ├── inventory.html
│   ├── login.html
│   ├── suppliers.html
│   └── create-purchase.html
├── utils/
│   └── ...                 # Helper functions
├── .env                    # Environment variables (jangan commit!)
├── env.example             # Contoh environment
├── go.mod                  # Go modules
├── go.sum
├── main.go                 # Entry point aplikasi
├── procurement_system.sql  # Database schema
└── README.md
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**.

```
MIT License

Copyright (c) 2025 Procurement System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan buat Pull Request atau buka Issue untuk diskusi.

---

<p align="center">
  Made with ❤️ using Go & Fiber
</p>
