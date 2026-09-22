# IndoKerja.id — Full Stack Developer Take-Home Assessment

Aplikasi **Job Application Management** ada dua peran:

- **JOB_SEEKER** — mencari & melamar pekerjaan, memantau status lamaran.
- **COMPANY** — membuat profil perusahaan, memasang & mengelola lowongan, memproses pelamar.

Repo ini berisi **dua aplikasi terpisah**:

```
full-stack-developer/
├── backend/    → REST API (NestJS + Prisma + PostgreSQL)
└── frontend/   → SPA (React + Vite + Tailwind)
```

---

## Teknologi

| Lapisan  | Teknologi                                                |
| -------- | -------------------------------------------------------- |
| Backend  | NestJS 11, Prisma 7, PostgreSQL                          |
| Auth     | JWT (access + rotating refresh token), bcrypt            |
| Frontend | React 19, Vite, Tailwind CSS v4, TanStack Query          |
| Form     | react-hook-form + Zod                                    |
| Infra    | **Railway** (backend + Postgres) + **Vercel** (frontend) |

> **Catatan deploy:** soal PDF menyebut `*.herokuapp.com`, tetapi Heroku mewajibkan input kartu kredit untuk membuat app baru, sehingga deploy dialihkan ke **Railway + Vercel** (tanpa kartu kredit, link publik tetap bisa dibuka untuk penilaian).

---

## Struktur Repo

- **`backend/`** — lihat [`backend/README.md`](backend/README.md) untuk setup, env, dan daftar endpoint.
- **`frontend/`** — lihat [`frontend/README.md`](frontend/README.md) untuk setup, env, dan daftar halaman.

---

## Cara Menjalankan di Lokal

> Prasyarat: Node 20+, PostgreSQL berjalan, dan `npm` tersedia.

### 1. Backend

```bash
cd backend
npm install
# isi .env dari .env.example
npx prisma migrate dev
npm run start:dev   # http://localhost:3000
```

### 2. Frontend

```bash
cd frontend
npm install
# isi .env dari .env.example (VITE_API_URL → http://localhost:3000)
npm run dev         # http://localhost:5173
```

---

## Alur Pengujian Cepat (lokal)

1. Buka `http://localhost:5173/register` → daftar akun **COMPANY**.
2. Login → buat profil perusahaan → buat lowongan.
3. Register akun **JOB_SEEKER** di jendela/incognito lain → login → lihat & lamar lowongan.
4. Kembali ke akun COMPANY → buka pelamar → ubah status lamaran.

---

## Deploy

| Komponen    | Platform         | URL (TODO)                                               |
| ----------- | ---------------- | -------------------------------------------------------- |
| Backend API | Railway          | `https://full-stack-developer-production.up.railway.app` |
| Frontend    | Vercel           | `https://rizaldi-full-stack-dev.vercel.app`              |
| Database    | Railway Postgres | `DATABASE_URL` (config var backend)                      |

Konfigurasi penting setelah deploy:

- Backend `FRONTEND_URL` = URL Vercel (untuk CORS).
- Frontend `VITE_API_URL` = URL Railway (untuk panggil API), lalu **rebuild**.

---

## Dummy User (for testing)

### JOB SEKKER

```
email : ical@mail.com
password : ical123456
```

### COMPANY

```
email : company@mail.com
password : ical123456
```

---
