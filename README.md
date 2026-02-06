# Task Manager

PM (Project Manager) uchun vazifalarni boshqarish tizimi. Admin tasklar yaratadi, developerlarga biriktiradi va jarayonni kuzatadi.

## Texnologiyalar

| Qatlam | Texnologiya |
|--------|-------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI + SQLAlchemy 2.0 (async) |
| Database | PostgreSQL 16 |
| Auth | Email/Password + bcrypt + JWT |
| Container | Docker + Docker Compose |

## Tizim imkoniyatlari

- **Auth**: Signup → Admin tasdiqlash → Login (JWT)
- **Rollar**: Admin (PM) va Developer
- **Tasklar**: CRUD + status boshqaruv (New → In Progress → Review → Done)
- **Dashboard**: Statistika, status/developer bo'yicha grafik, muddati o'tganlar
- **Kommentlar**: Task ichida muhokama
- **Foydalanuvchilar**: Admin tomonidan tasdiqlash/rad etish

## Ishga tushirish

### 1. Reponi klonlash

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Environment sozlash

```bash
cp .env.example .env
```

`.env` faylni tahrirlang:

```env
DB_PASSWORD=your_secure_password
SECRET_KEY=your-random-secret-key-at-least-32-chars
INITIAL_ADMIN_EMAIL=admin@yourcompany.com
```

### 3. Docker bilan ishga tushirish

```bash
docker compose up --build
```

### 4. Tayyor!

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger Docs | http://localhost:8000/docs |

### 5. Birinchi admin

`INITIAL_ADMIN_EMAIL` dagi email bilan `/signup` sahifasidan ro'yxatdan o'ting — avtomatik admin bo'lasiz.

## Production

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

Production rejimda frontend nginx orqali port 80 da ishlaydi.

## API Endpointlar

### Auth — `/api/v1/auth`
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/signup` | Ro'yxatdan o'tish |
| POST | `/login` | Kirish → JWT |
| POST | `/refresh` | Token yangilash |
| GET | `/me` | Joriy user |

### Users — `/api/v1/users` (Admin)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/` | Barcha userlar |
| GET | `/pending` | Kutayotganlar |
| GET | `/developers` | Tasdiqlangan devlar |
| PATCH | `/{id}/approve` | Tasdiqlash |
| PATCH | `/{id}/reject` | Rad etish |

### Tasks — `/api/v1/tasks`
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/` | Tasklar (filter, search, pagination) |
| GET | `/{id}` | Task tafsiloti |
| POST | `/` | Yangi task (Admin) |
| PUT | `/{id}` | Tahrirlash (Admin) |
| PATCH | `/{id}/status` | Status o'zgartirish |
| DELETE | `/{id}` | O'chirish (Admin) |
| GET | `/stats` | Dashboard statistikasi (Admin) |

### Comments — `/api/v1/tasks/{task_id}/comments`
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/` | Kommentlar |
| POST | `/` | Komment qo'shish |
| DELETE | `/{comment_id}` | O'chirish |

## Loyiha strukturasi

```
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── .env.example
│
├── backend/
│   ├── app/
│   │   ├── api/v1/             # Endpointlar
│   │   ├── core/               # Security, exceptions
│   │   ├── database/           # Engine, session
│   │   ├── models/             # SQLAlchemy modellari
│   │   ├── schemas/            # Pydantic schemalar
│   │   ├── services/           # Biznes logika
│   │   └── utils/              # Enumlar
│   └── alembic/                # Migratsiyalar
│
└── frontend/
    └── src/
        ├── api/                # Axios calls
        ├── components/         # UI komponentlar
        ├── contexts/           # Auth context
        ├── hooks/              # Custom hooks
        ├── pages/              # Sahifalar
        └── utils/              # Helpers, constants
```

## Seed ma'lumotlar

Test ma'lumotlarini qo'shish uchun:

```bash
docker exec taskmanager_backend python seed.py
```

## Litsenziya

MIT
