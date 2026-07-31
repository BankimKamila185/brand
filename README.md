# Tevar — Enterprise Fashion E-Commerce Platform

Tevar is a high-performance, full-stack E-Commerce platform built for modern fashion retail. It features a Next.js 16 Storefront & Admin Portal deployed on **Vercel**, integrated with a Node.js/Express REST API on **Render**, **Neon DB** (Serverless PostgreSQL), **Render Redis**, and **Cloudflare R2** for image storage.

## 📌 Architecture & Tech Stack Documentation
For the complete technical specification, system architecture diagrams, database schema breakdown, and cloud infrastructure layout, please refer to:
👉 **[ARCHITECTURE.md](file:///Users/bankimkamila/Tevar/ARCHITECTURE.md)**

---

## 🛠 Production Tech Stack Overview
* **Frontend Hosting**: **Vercel** (Next.js 16 App Router, React 19, Tailwind CSS v4, Zustand, Framer Motion, Radix UI, TanStack Table, Recharts).
* **Backend Hosting**: **Render Web Service** (Node.js 20, Express API, Prisma ORM 5, Zod, JWT, Winston, Helmet).
* **Database**: **Neon DB** (Serverless PostgreSQL 16 with autoscaling & connection pooling).
* **Cache & Rate Limiting**: **Render Redis** (Managed Redis 7 with LRU memory eviction).
* **Image CDN & Storage**: **Cloudflare R2** (S3-compatible bucket via `@aws-sdk/client-s3` with zero-egress fees) & Cloudinary.
* **Integrations**: Razorpay Payments, Firebase Admin SDK (FCM Push Notifications), SMTP Mailer.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
* Node.js v20+
* Docker & Docker Compose (or local Postgres/Redis instances)

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
