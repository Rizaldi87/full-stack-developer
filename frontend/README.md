# Frontend — IndoKerja SPA

Single Page Application untuk platform IndoKerja: cari & lamar pekerjaan (JOB_SEEKER) serta kelola lowongan dan pelamar (COMPANY).

---

## Teknologi

| Komponen              | Versi   |
| --------------------- | ------- |
| React                 | ^19     |
| Vite                  | ^8      |
| Tailwind CSS          | ^4      |
| TanStack Query        | ^5      |
| react-router-dom      | ^7      |
| react-hook-form + Zod | ^7 / ^4 |
| axios                 | ^1      |
| Linter                | oxlint  |

---

## Struktur Folder

```
frontend/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx             # entry: QueryClientProvider + Router
│   ├── index.css            # Tailwind v4 (@import "tailwindcss")
│   ├── api/                 # axios client + per-endpoint (auth, jobs, company, applications)
│   ├── auth/AuthContext.tsx # token storage + login/logout state
│   ├── components/
│   │   ├── layout/          # Layout, Navbar
│   │   └── ui/              # Button, Input, Select, Badge, Spinner, EmptyState, Pagination
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── jobs/            # JobListPage, JobDetailPage
│   │   ├── seeker/          # MyApplicationsPage
│   │   └── company/         # CompanyJobsPage, CreateJobPage, ApplicantsPage
│   ├── routes/              # index.tsx (definisi rute), ProtectedRoute, ProtectedRoutes
│   ├── types/index.ts       # tipe shared (Job, Application, User, dll.)
│   └── utils/
│       ├── format.ts        # formatSalary, formatDate, badge status
│       └── schemas.ts       # zod schema login/register/company/job
```

---

## Setup Lokal

```bash
npm install

# 1) Buat file .env lalu isi:
#    VITE_API_URL=http://localhost:3000

npm run dev    # → http://localhost:5173
```

---

## Variabel Lingkungan

| Variabel       | Contoh                  | Keterangan                                  |
| -------------- | ----------------------- | ------------------------------------------- |
| `VITE_API_URL` | `http://localhost:3000` | Base URL backend (production = URL Railway) |

> Vite membaca `VITE_*` **saat build**, jadi set sebelum `npm run build` / deploy, bukan sesudahnya.

---

## Skrip

| Perintah          | Fungsi                                            |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Dev server + HMR (Vite)                           |
| `npm run build`   | Type-check (`tsc -b`) + bundle produksi → `dist/` |
| `npm run preview` | Pratinjau hasil build lokal                       |
| `npm run lint`    | oxlint                                            |

---

## Rute Aplikasi

| Rute                           | Halaman                                                    | Akses               |
| ------------------------------ | ---------------------------------------------------------- | ------------------- |
| `/`                            | JobListPage (browse lowongan)                              | Publik              |
| `/jobs/:id`                    | JobDetailPage + tombol lamar                               | Publik / JOB_SEEKER |
| `/login`                       | LoginPage                                                  | Publik              |
| `/register`                    | RegisterPage (pilih JOB_SEEKER/COMPANY)                    | Publik              |
| `/my-applications`             | MyApplicationsPage                                         | JOB_SEEKER          |
| `/company/jobs`                | CompanyJobsPage (daftar lowongan + onboarding buat profil) | COMPANY             |
| `/company/jobs/new`            | CreateJobPage                                              | COMPANY             |
| `/company/jobs/:id/applicants` | ApplicantsPage (pelamar + ubah status)                     | COMPANY             |

Rute di bawah `/company/*` dan `/my-applications` dibungkus `ProtectedRoute` (cek token + role).

---

## Alur Data

1. `src/api/client.ts` → axios instance, baseURL `VITE_API_URL`, otomatis **attach access token** & **refresh** kalau 401.
2. Tiap halaman memakai **TanStack Query** (`useQuery` untuk baca, `useMutation` untuk tulis).
3. Validasi form memakai **Zod** lewat `@hookform/resolvers/zod`.
4. Status lamaran ditampilkan pakai `utils/format.ts` (`applicationStatusColor`, `statusLabel`, `getNextStatuses`).

---
