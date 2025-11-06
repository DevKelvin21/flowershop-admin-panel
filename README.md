# 🌸 Flowershop Admin Panel

A full-stack flower shop management system built with modern web technologies. This monorepo contains both frontend and backend applications for managing inventory, tracking losses, and monitoring financial operations.

## 📦 Project Structure

This is a **monorepo** containing two main applications:

```
flowershop-admin-panel/
├── web/          # 🎨 React frontend application
└── api/          # 🚀 NestJS backend API
```

### 🎨 Frontend (`/web`)

A modern, production-ready admin panel built with **React 19**, **TypeScript**, and **TailwindCSS**.

**Key Features:**
- 🔐 Firebase Authentication
- 📊 Real-time inventory management
- 📉 Loss tracking with automatic stock adjustment  
- 💰 Financial reports (sales, expenses, summaries)
- 🎯 Advanced filtering and search
- 🏗️ Clean architecture with repository pattern
- 📱 Responsive, mobile-friendly UI

**Tech Stack:** React 19, TypeScript 5.8, Vite 6, TailwindCSS 4, Firebase 11, React Router 7

👉 **[View Frontend Documentation](./web/README.md)** for detailed architecture, setup, and development guides.

---

### 🚀 Backend (`/api`)

A scalable REST API built with **NestJS** and **Prisma ORM** (currently in development).

**Key Features:**
- 🏗️ Built with NestJS framework
- 🗄️ Prisma ORM for type-safe database access
- 📊 SQLite database (development)
- 🧪 Unit and E2E testing setup
- 🔄 Database migrations support

**Tech Stack:** NestJS, TypeScript, Prisma, SQLite

👉 **[View Backend Documentation](./api/README.md)** for API setup and development instructions.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Firebase Project** (for frontend authentication)
- **Git** for version control

### Getting Started

#### 1. Clone the Repository

```bash
git clone <repository-url>
cd flowershop-admin-panel
```

#### 2. Setup Frontend

```bash
cd web
npm install

# Create .env file with Firebase credentials
cp .env.example .env  # (if available)
# Edit .env with your Firebase config

npm run dev  # Start on http://localhost:5173
```

#### 3. Setup Backend

```bash
cd api
npm install

# Generate Prisma Client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

npm run start:dev  # Start on http://localhost:3000
```

---

## 🏗️ Architecture Overview

### Current Architecture

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  👤 User Browser                                      │
│                                                       │
└────────────┬──────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────┐
│  🎨 React Frontend (Port 5173)                     │
│  - Authentication UI                               │
│  - Inventory Management                            │
│  - Loss Tracking                                   │
│  - Financial Reports                               │
└────────────┬───────────────────────────────────────┘
             │
             ├──────────────┐
             │              │
             ▼              ▼
    ┌─────────────┐   ┌─────────────┐
    │  🔥 Firebase │   │ 🚀 NestJS   │
    │  (Primary)   │   │  (Future)   │
    │  - Auth      │   │  - REST API │
    │  - Firestore │   │  - Prisma   │
    └─────────────┘   └─────────────┘
```

### Migration Strategy

The project is currently transitioning from Firebase Backend-as-a-Service to a custom NestJS API:

- **Phase 1** (Current): Frontend uses Firebase for authentication and Firestore for data
- **Phase 2** (In Progress): NestJS API being developed with Prisma ORM
- **Phase 3** (Future): Full migration to NestJS API with Firebase Auth integration

---

## 📚 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI library |
| TypeScript | 5.8 | Type safety |
| Vite | 6 | Build tool |
| TailwindCSS | 4 | Styling |
| Firebase | 11 | Auth & Database |
| React Router | 7 | Navigation |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | Latest | API framework |
| TypeScript | Latest | Type safety |
| Prisma | Latest | ORM |
| SQLite | - | Database (dev) |

---

## 🛠️ Development Workflow

### Frontend Development

```bash
cd web
npm run dev      # Start dev server with HMR
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Development

```bash
cd api
npm run start:dev        # Start with hot-reload
npm run start:prod       # Production mode
npm run test             # Run unit tests
npm run test:e2e         # Run E2E tests
npm run prisma:studio    # Open Prisma Studio GUI
```

---

## 📁 Key Directories

### Frontend Structure (`/web/src`)

```
src/
├── pages/           # Page-level components (Container/View pattern)
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
├── services/        # Business logic & service instances
├── repositories/    # Data access layer (Repository pattern)
├── auth/            # Authentication services
├── routes/          # Routing configuration
└── shared/          # Types, models, constants
```

### Backend Structure (`/api/src`)

```
src/
├── app.module.ts      # Root module
├── app.controller.ts  # Main controller
├── app.service.ts     # Application service
├── prisma/            # Prisma service module
└── main.ts            # Application entry point
```

---

## 🎯 Features

### ✅ Implemented
- [x] User authentication with Firebase
- [x] Inventory management (CRUD operations)
- [x] Loss tracking with automatic inventory adjustment
- [x] Real-time data updates
- [x] Advanced filtering and search
- [x] Financial reports and summaries
- [x] Responsive UI design
- [x] Audit logging
- [x] NestJS backend scaffold with Prisma

### 🚧 In Progress
- [ ] REST API endpoints in NestJS
- [ ] Database schema design in Prisma
- [ ] API integration in frontend
- [ ] End-to-end testing

### 📋 Planned
- [ ] Complete migration from Firebase to NestJS API
- [ ] Advanced analytics dashboard
- [ ] Multi-user support with role-based access
- [ ] Export functionality (CSV, PDF)
- [ ] Email notifications
- [ ] Mobile app (React Native)

---

## 🧪 Testing

### Frontend
The frontend is architected for testability with dependency injection, though comprehensive tests are pending.

**Recommended tools:**
- Vitest for unit tests
- React Testing Library for component tests
- MSW for API mocking

### Backend
NestJS comes with built-in testing support:

```bash
cd api
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
npm run test:cov    # Test coverage
```

---

## 🔒 Environment Variables

### Frontend (`/web/.env`)

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Backend (`/api/.env`)

```env
DATABASE_URL="file:./prisma/dev.db"
PORT=3000
```

---

## 🚀 Deployment

### Frontend Deployment

The frontend can be deployed to:
- **Vercel** (recommended for Vite apps)
- **Netlify**
- **Firebase Hosting**
- **Any static hosting service**

```bash
cd web
npm run build
# Deploy the dist/ folder
```

### Backend Deployment

The backend can be deployed to:
- **Railway**
- **Render**
- **Heroku**
- **AWS/GCP/Azure**
- **NestJS Mau** (official NestJS platform)

```bash
cd api
npm run build
npm run start:prod
```

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style:** Follow existing patterns (Container/View, Repository Pattern)
2. **TypeScript:** Use strict mode and explicit types
3. **Architecture:** Maintain clean separation of concerns
4. **Testing:** Write tests for new features (when testing is implemented)
5. **Documentation:** Update README files when adding major features

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches

### Commit Messages

Follow conventional commits:
```
feat: Add user profile page
fix: Resolve inventory calculation bug
docs: Update API documentation
refactor: Improve repository pattern implementation
```

---

## 📖 Documentation Links

- **[Frontend Architecture Guide](./web/README.md)** - Detailed frontend architecture and patterns
- **[Backend API Guide](./api/README.md)** - NestJS setup and usage
- [React Documentation](https://react.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

---

## 📝 License

This project is private and proprietary.

---

## 👥 Team & Support

For questions, issues, or contributions, please contact the development team or open an issue in the repository.

---

**Built with 🌸 for modern flower shop management**

