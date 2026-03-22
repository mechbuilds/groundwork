# Groundwork — Property & Homestead Logbook

A full-stack personal productivity app for property owners to log daily work, track expenses, and review monthly reports. Built for real personal use — not a tutorial clone.

![Groundwork Dashboard](./client/public/dashboard.png)

---

## Why I Built This

I needed a way to record what I do around my property every day — repairs, landscaping, maintenance — and track what I spend on materials and tools. Nothing existing felt right, so I built exactly what I needed.

This project also gave me the opportunity to build a complete fullstack application from scratch without relying on any paid third-party services.

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS (custom design system)
- Framer Motion
- React Router v6
- Recharts
- date-fns
- Lucide React
- shadcn/ui components

### Backend
- Node.js + Express
- Prisma ORM (v7)
- PostgreSQL
- JWT Authentication
- bcryptjs
- Multer (file uploads)

### Architecture
```
React (port 8080)  →  Express API (port 5000)  →  PostgreSQL
```

---

## Features

- **Authentication** — Secure register/login with JWT, bcrypt password hashing
- **Daily Journal** — Log property work with title, category, duration, description and photos
- **Expense Tracker** — Track spending with categories, edit/delete, monthly summaries
- **Monthly Reports** — Visual breakdown of work hours and spending by category with pie charts
- **Dashboard** — At-a-glance stats, spending chart, recent activity
- **Settings** — Update property name and profile

---

## Database Schema
```
User
 ├── LogEntry (title, description, category, duration, photos)
 └── Expense (description, amount, category, receipt)
 └── Category (custom categories with colors)
```

All tables use UUID primary keys. Row-level data isolation — users only see their own data.

---

## Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL installed and running

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/groundwork.git
cd groundwork
```

### 2. Set up the database
```bash
psql -U postgres
CREATE DATABASE groundwork;
\q
```

### 3. Configure the backend
```bash
cd server
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/groundwork"
JWT_SECRET="your-secret-key"
PORT=5000
```

### 4. Run database migrations
```bash
cd server
npm install
npx prisma migrate dev
npx prisma generate
```

### 5. Configure the frontend
```bash
cd ../client
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000
```

### 6. Install frontend dependencies
```bash
npm install
```

### 7. Start the application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open `http://localhost:8080`

---

## Project Structure
```
groundwork/
├── client/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── api/            # Axios API functions
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth context
│   │   └── pages/          # Route pages
│   └── package.json
│
└── server/                 # Node.js + Express backend
    ├── src/
    │   ├── middleware/      # JWT auth middleware
    │   └── routes/         # API route handlers
    ├── prisma/
    │   └── schema.prisma   # Database schema
    └── package.json
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Get current user |
| GET | /api/entries | List journal entries |
| POST | /api/entries | Create entry |
| PUT | /api/entries/:id | Update entry |
| DELETE | /api/entries/:id | Delete entry |
| GET | /api/expenses | List expenses |
| POST | /api/expenses | Create expense |
| PUT | /api/expenses/:id | Update expense |
| DELETE | /api/expenses/:id | Delete expense |
| GET | /api/reports/dashboard | Dashboard stats |
| GET | /api/reports/monthly | Monthly report |

---

## Design

Custom dark theme built with Tailwind CSS:
- **Typefaces**: Playfair Display (headings), DM Mono (data), DM Sans (body)
- **Color palette**: Off-black, warm parchment, earth amber, forest ink
- **Aesthetic**: Editorial warmth — like a field notebook turned into software

---

## Author

Built by **mechbuilds** — a Computer Science graduate building real tools for real problems.

- GitHub: [@mechbuilds](https://github.com/mechbuilds)