# Tevar — Enterprise Fashion E-Commerce Platform

Tevar is a high-performance, full-stack E-Commerce platform built for modern fashion retail. It features a Next.js 16 Storefront & Admin Portal integrated with a scalable Node.js/Express REST API, PostgreSQL database, Prisma ORM, and Redis cache.

## 📌 Architecture & Tech Stack Documentation
For the complete technical specification, system architecture diagrams, database schema breakdown, and security specifications, please refer to:
👉 **[ARCHITECTURE.md](file:///Users/bankimkamila/Tevar/ARCHITECTURE.md)**

---

## 🚀 Quick Start

### 1. Prerequisites
* Node.js v20+
* Docker & Docker Compose

### 2. Infrastructure Setup (Local)
Start PostgreSQL 16 & Redis 7 containers:
```bash
docker-compose up -d postgres redis
```

### 3. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev
```
Backend API will be running on `http://localhost:4000`.

### 4. Frontend Setup
```bash
npm install
npm run dev
```
Frontend Storefront & Admin will be running on `http://localhost:3000`.

---

## 🛠 Tech Stack Overview
* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS v4, Zustand, Framer Motion, Radix UI, TanStack Table, Recharts.
* **Backend**: Node.js, Express, Prisma ORM 5, PostgreSQL 16, Redis 7, Zod, JWT, Winston, Helmet.
* **Integrations**: Razorpay Payments, Cloudinary / AWS S3 Assets, Firebase Admin SDK, SMTP Mailer.
