# 🔌 HomeConnect — Smart Home Automation System (Backend API)

> 🏆 **University Academic Project | Express.js + TypeScript | Modular Architecture**

A scalable, secure, and production-ready backend API for managing smart home devices, rentals, payments, and user authentication — built with modern best practices for academic excellence and real-world portfolio readiness.

---

## 🎓 Project Overview

**Course**: Software Engineering / Web Technologies / Advanced Programming  
**Institution**: European University of Bangladesh  
**Submitted By**: MD. Shihab Uddin  
**Student ID**: 220322055  
**Supervisor**: Jannatun Ferdows

### 💡 This project demonstrates mastery of:

> - Backend architecture design (Modular, Layered)
> - TypeScript strict typing & Express.js routing
> - JWT Authentication & Input Validation (Zod)
> - PM2 Process Management & Winston Logging
> - RESTful API versioning & Swagger Documentation
> - Git Collaboration & CI/CD Readiness

---

## 🧩 Features

✅ **User Authentication** — Secure JWT-based login/register  
✅ **Smart Device Management** — CRUD for lights, plugs, ACs  
✅ **Rent/Buy System** — Post, list, and manage rental items  
✅ **Payment Integration** — Stripe/PayPal mock (ready to plug real)  
✅ **Notifications** — Email/SMS (Nodemailer/Twilio ready)  
✅ **Dashboard Analytics** — Usage stats, device activity  
✅ **Swagger API Docs** — Auto-generated at `/api-docs`  
✅ **Graceful Shutdown & Logging** — Production-grade reliability  
✅ **Module-Based Structure** — Scalable, team-friendly architecture

---

## 🚀 Tech Stack

| Layer             | Technology                          |
|-------------------|-------------------------------------|
| Runtime           | Node.js 18+                         |
| Framework         | Express.js                          |
| Language          | TypeScript (Strict Mode)            |
| Auth              | JWT + Bcrypt                        |
| Validation        | Zod                                 |
| Database          | MongoDB (Mongoose)                  |
| Process Manager   | PM2 (Production) / Nodemon (Dev)    |
| Logger            | Winston                             |
| Security          | Helmet, CORS, Rate Limiting         |
| API Docs          | Swagger UI                          |
| Code Quality      | ESLint + Prettier + Husky           |
| Deployment Ready  | Docker + PM2 + Environment Config   |

---

## 📂 Architecture Diagram (Conceptual)

```bash
src/
├── modules/ → Feature-based isolation (Auth, Devices, Rentals...)
├── shared/ → Reusable middleware, config, utils
├── main.routes.ts → Central route aggregator
└── app.ts → Express server factory
```

> 🖼️ *(Add actual diagram image later — e.g., draw.io or Mermaid)*

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm / yarn

### Installation

```bash
git clone https://github.com/yourusername/homeconnect-backend.git
cd homeconnect-backend
npm install
cp .env.example .env
npm run dev
```
## Environment Variables (.env)

```bash
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/homeconnect
JWT_SECRET=your_32char_super_secret_here
FRONTEND_URL=http://localhost:3000
```

## Scripts

```bash
npm run dev       # Development with hot-reload
npm run build     # Compile TypeScript
npm run start     # Start with PM2 (production)
npm run lint      # Check code quality
npm run format    # Auto-format code
```

## 📖 API Documentation
After starting server, visit:

👉 http://localhost:5000/api-docs

Auto-generated Swagger UI for all modules:

- Auth — Login, Register, Refresh Token
- Devices — List, Control, Add Smart Devices
- Rentals — Post, Search, Book Rental Items
- Payments — Simulate Payment Flow
- Notifications — Trigger Email Alerts
- 🧪 Testing (Future Scope)
- Unit & Integration tests can be added using:
- Jest + Supertest
- Test coverage via nyc
- (Currently placeholder — expand for final submission)

## 🤝 Contribution Guidelines
This is an academic project — but structured for open collaboration:

## Fork the repo
- Create feature branch (git checkout -b feature/module-name)
- Commit changes (git commit -m 'feat: add xyz')
- Push to branch (git push origin feature/module-name)
- Open Pull Request
✍️ Use Conventional Commits for clean history.

## 📸 Screenshots (Placeholder)
> 🖼️ Add Postman screenshots, Swagger UI, Log outputs, Architecture Diagram here before final submission.

## 📚 References & Credits
```bash
Express.js Documentation
TypeScript Handbook
MongoDB University
JWT RFC 7519
“Clean Code” by Robert C. Martin
University Course Materials
```

## 📄 License
MIT License — For academic use and portfolio展示 only.

## 🙋‍♂️ Contact
```bash
Developer: Maker Shiahb
Email: frontendmaker99@gmail.com
LinkedIn: linkedin.com/in/makershihab
GitHub: github.com/makershiahb
```