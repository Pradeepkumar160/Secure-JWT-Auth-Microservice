# 🔐 SecureAuth Microservice

A production-ready JWT Authentication Microservice with email verification, RBAC, and brute-force protection.

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

- ✅ JWT Access & Refresh Token rotation
- ✅ Email verification on registration
- ✅ Role-Based Access Control (RBAC)
- ✅ Brute-force & rate limiting protection
- ✅ Swagger API documentation
- ✅ MySQL database with Drizzle ORM
- ✅ tRPC for type-safe API
- ✅ React + Tailwind frontend

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express.js |
| API | tRPC |
| Frontend | React + Tailwind CSS |
| Database | MySQL + Drizzle ORM |
| Auth | JWT (access + refresh tokens) |
| Email | Nodemailer + Gmail |
| Security | Helmet, CORS, Rate Limiting |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- MySQL database

### Installation

1. Clone the repository
```bash
   git clone https://github.com/Pradeepkumar160/secure-auth-microservice.git
   cd secure-auth-microservice
```

2. Install dependencies
```bash
   pnpm install
```

3. Set up environment variables
```bash
   cp .env.example .env
```

4. Fill in your `.env`:
```env
   DATABASE_URL=mysql://user:password@host:3306/dbname
   JWT_SECRET=your-super-secret-key
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   CLIENT_URL=http://localhost:4000
   PORT=4000
```

5. Run database migrations
```bash
   pnpm db:push
```

6. Start the development server
```bash
   pnpm run dev
```

7. Open **http://localhost:4000**

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trpc/auth.register` | Register new user |
| POST | `/api/trpc/auth.login` | Login user |
| POST | `/api/trpc/auth.logout` | Logout user |
| GET | `/api/trpc/auth.verifyEmail` | Verify email token |
| POST | `/api/trpc/auth.refreshToken` | Refresh JWT token |

## 📖 API Documentation

Swagger UI available at: `http://localhost:4000/api-docs`

## 🔒 Security Features

- **Rate Limiting** — 100 requests/min on API routes
- **Brute Force Protection** — 5 login attempts per 15 minutes
- **Helmet** — Secure HTTP headers
- **JWT Rotation** — Short-lived access tokens + refresh tokens
- **Email Verification** — Required before login

## 📁 Project Structure

secure-auth-microservice/
├── client/                                                      # React frontend
├── server/
│   ├── _core/                                                   # Server setup, tRPC, Vite
│   ├── middlewares/                                             # Rate limiting, security
│   ├── routers/                                                 # Auth & user routes
│   └── services/                                                # Auth & email services
├── shared/                                                      # Shared types & constants
├── .env.example                                                 # Environment template
└── README.md

## 🤝 Contributing

Pull requests are welcome!

## 📄 License

MIT Licenses
