# Backend — IndoKerja REST API

REST API untuk platform IndoKerja, dibangun dengan **NestJS 11 + Prisma 7 + PostgreSQL**. Menangani autentikasi (JWT access + rotating refresh token), profil pengguna & perusahaan, lowongan pekerjaan, dan alur lamaran (real job-application workflow dengan transisi status terkontrol).

---

## Teknologi & Versi

| Komponen                                         | Versi |
| ------------------------------------------------ | ----- |
| NestJS (platform-express)                        | ^11   |
| Prisma (generator `prisma-client`, adapter `pg`) | ^7    |
| PostgreSQL                                       | 13+   |
| JWT (passport-jwt, manual refresh)               | ^12   |
| bcrypt                                           | ^6    |
| class-validator / class-transformer              | ^0    |
| Jest (unit) + Supertest (e2e)                    | ^30   |

> Prisma 7 dipakai dengan **driver adapter `pg`** — `DATABASE_URL` dibaca di `PrismaService` (bukan dari `env()` di `schema.prisma`), sehingga schema tidak bergantung pada url statis.

---

## Struktur Folder

```
backend/
├── prisma/
│   ├── schema.prisma      # model, enum (Role, JobStatus, ApplicationStatus, dll.)
│   └── migrations/        # riwayat migrasi Prisma
├── generated/prisma/      # Prisma Client (hasilkan via `npx prisma generate`)
├── src/
│   ├── main.ts            # bootstrap, global ValidationPipe, CORS, dengar di 0.0.0.0
│   ├── app.module.ts      # modul root; konfigurasi ConfigModule global
│   ├── prisma/            # PrismaService
│   ├── auth/              # register, login, me, refresh, guards (JwtAuthGuard, RolesGuard)
│   ├── users/             # CRUD pengguna
│   ├── company/           # profil perusahaan (create/me/update)
│   ├── jobs/              # lowongan (browse/list:public, detail, create, update)
│   ├── jobs/company-jobs/ # daftar lowongan milik perusahaan
│   └── applications/      # lamaran (apply, list milik user/pelamar, update status, riwayat)
└── test/                  # e2e test (*.e2e-spec.ts)
```

---

## Prasyarat

- **Node.js 20+**
- **npm**
- **PostgreSQL** berjalan lokal (buat database kosong, mis: `indokerja`)

> Kalau belum punya PostgreSQL lokal, Prisma punya opsi `npx create-db` (membuat Postgres gratis secara otomatis) — hasilnya tinggal diisi ke `DATABASE_URL`.

---

## Setup Lokal

```bash
npm install

# 1) Konfigurasi env — salin template lalu isi
cp .env.example .env

# 2) Buat database + jalankan migrasi
npx prisma migrate dev          # membuat tabel sesuai schema

# sidebar: kalau schema.prisma berubah dan butuh regenerate client:
npx prisma generate

# 3) Jalankan (mode develop, hot-reload)
npm run start:dev               # → http://localhost:3000
```

Dokumentasi API interaktif tersedia selama app hidup:
**http://localhost:3000/api** (Swagger) → seluruh endpoint bisa dicoba langsung dari browser.

---

## Variabel Lingkungan

Semua wajib diisi di `.env` (template: `.env.example`):

| Variabel                 | Contoh                                            | Keterangan                                                  |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| `DATABASE_URL`           | `postgresql://user:pass@localhost:5432/indokerja` | Koneksi PostgreSQL (via adapter `pg`)                       |
| `JWT_SECRET`             | string random panjang                             | Secret access token                                         |
| `JWT_EXPIRES_IN`         | `15m`                                             | Masa berlaku access token (format `ms`)                     |
| `JWT_REFRESH_SECRET`     | string random panjang                             | Secret refresh token                                        |
| `JWT_REFRESH_EXPIRES_IN` | `30d`                                             | Masa berlaku refresh token (format `ms`)                    |
| `FRONTEND_URL`           | `http://localhost:5173`                           | Domain yang diizinkan CORS (produksi = URL Vercel frontend) |
| `PORT`                   | `3000`                                            | Port; platform deploy meng-overwrite otomatis               |

> Gunakan secret yang berbeda & panjang untuk `JWT_SECRET` dan `JWT_REFRESH_SECRET` (jangan sama).

---

## Skrip

| Perintah                    | Fungsi                                     |
| --------------------------- | ------------------------------------------ |
| `npm run start:dev`         | Jalankan dengan hot-reload (dev)           |
| `npm run build`             | `prisma generate` + `nest build` → `dist/` |
| `npm run start:prod`        | `node dist/main` (produksi)                |
| `npm run lint`              | ESLint + Prettier fix                      |
| `npm test`                  | Unit test (Jest)                           |
| `npm run test:e2e`          | Test end-to-end                            |
| `npx prisma migrate dev`    | Migrasi dev (buat/ubah tabel)              |
| `npx prisma migrate deploy` | Terapkan migrasi (produksi/CI)             |

---

## Endpoint API

Semua di bawah root (default `http://localhost:3000`). Header `Authorization: Bearer <accessToken>` dibutuhkan kecuali dinyatakan **publik**.

### Auth — `/auth`

| Metode | Rute             | Akses  | Deskripsi                                                     |
| ------ | ---------------- | ------ | ------------------------------------------------------------- |
| POST   | `/auth/register` | Publik | Registrasi `JOB_SEEKER` atau `COMPANY` (bcrypt hash password) |
| POST   | `/auth/login`    | Publik | Login → `{ accessToken, refreshToken, user }`                 |
| GET    | `/auth/me`       | Auth   | Profil user yang sedang login                                 |
| POST   | `/auth/refresh`  | Auth   | Rotasi refresh token → pasangan token baru                    |

### Users — `/users`

| Metode | Rute         | Akses | Deskripsi   |
| ------ | ------------ | ----- | ----------- |
| POST   | `/users`     | Admin | Buat user   |
| GET    | `/users`     | Admin | Daftar user |
| GET    | `/users/:id` | Admin | Detail user |
| PATCH  | `/users/:id` | Admin | Ubah user   |
| DELETE | `/users/:id` | Admin | Hapus user  |

### Company — `/company`

| Metode | Rute          | Akses   | Deskripsi                    |
| ------ | ------------- | ------- | ---------------------------- |
| POST   | `/company`    | COMPANY | Buat profil perusahaan       |
| GET    | `/company/me` | COMPANY | Profil perusahaan milik akun |
| PATCH  | `/company/me` | COMPANY | Update profil perusahaan     |

### Jobs — `/jobs`

| Metode | Rute            | Akses   | Deskripsi                                                         |
| ------ | --------------- | ------- | ----------------------------------------------------------------- |
| GET    | `/jobs`         | Publik  | Daftar lowongan (filter: q/type/location/salary mode, pagination) |
| GET    | `/jobs/:id`     | Publik  | Detail lowongan                                                   |
| POST   | `/jobs`         | COMPANY | Buat lowongan                                                     |
| PATCH  | `/jobs/:id`     | COMPANY | Update status/detail lowongan (closed, dll)                       |
| GET    | `/company/jobs` | COMPANY | Daftar lowongan milik perusahaan                                  |

### Applications — `/applications`

| Metode | Rute                        | Akses      | Deskripsi                                      |
| ------ | --------------------------- | ---------- | ---------------------------------------------- |
| POST   | `/jobs/:id/applications`    | JOB_SEEKER | Lamar lowongan (cek duplikasi + lowongan OPEN) |
| GET    | `/jobs/:id/applications`    | COMPANY    | Daftar pelamar lowongan tertentu               |
| GET    | `/applications/me`          | JOB_SEEKER | Daftar lamaran user yang login                 |
| PATCH  | `/applications/:id/status`  | COMPANY    | Ubah status lamaran (sesuai aturan transisi)   |
| GET    | `/applications/:id/history` | COMPANY    | Riwayat perubahan status lamaran               |

---

## Alur Lamaran & Transisi Status

Status lamaran: `APPLIED → REVIEWING → SHORTLISTED → (ACCEPTED | REJECTED)`.

Perpindahan **hanya boleh maju** dan divalidasi di backend:

- `APPLIED` → `REVIEWING` | `REJECTED`
- `REVIEWING` → `SHORTLISTED` | `REJECTED`
- `SHORTLISTED` → `ACCEPTED` | `REJECTED`
- `REJECTED` & `ACCEPTED` → terminal (tidak bisa diubah lagi)

Mengubah status **selalu menghapus session/review** yang sedang berjalan untuk lamaran tersebut, agar tidak ada review ganda, dan memunculkan `ApplicationHistoryRecord` baru.

---

## Menjalankan Test

```bash
npm test             # unit test
npm run test:e2e     # end-to-end (butuh DATABASE_URL + DB yang sudah migrate)
```

---
