 Wrote README.md
# LogiPilot AI

**Predict. Optimize. Deliver.**

An AI-powered logistics operations platform that predicts shipment delays, optimizes delivery routes, monitors fleets in real-time, and makes proactive operational decisions using traffic, weather, and historical dispatch data.

---

## Table of Contents

- [Vision](#vision)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Design System](#design-system)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Authentication \& RBAC](#authentication--rbac)
- [Design Tokens \& CSS](#design-tokens--css)
- [Page Routes](#page-routes)
- [Deployment](#deployment)
- [Roadmap](#roadmap)

---

## Vision

Traditional logistics software reports events **after** they occur. LogiPilot AI predicts disruptions **before** they happen and recommends corrective actions to minimize delays, costs, and operational risks.

**Core Differentiators:**

1. Delay Prediction Engine (85%+ accuracy target)
2. Route Optimization Engine
3. Logistics Intelligence Score (LIS)
4. Multi-Agent AI Copilot
5. Real-Time Traffic + Weather Intelligence
6. Explainable AI Recommendations

---

## Features

### Operations Dashboard
- Global Operations Center with KPI grid, live map, high-risk table, AI recommendations
- Animated count-up KPI cards (Active Shipments, On-Time Rate, Fleet Utilization, Active Alerts)
- Floating AI Copilot widget for natural language queries

### Shipment Management
- Full CRUD with status tracking (Created → Dispatched → In Transit → Delivered/Delayed/Cancelled)
- Priority levels (Low, Medium, High, Critical)
- Driver and vehicle assignment
- Batch predictions (delay, ETA, risk)

### Fleet Command
- Vehicle roster with live GPS tracking
- Route visualization on interactive Leaflet map
- Vehicle marker color coding by status
- Layer controls (Standard/Terrain/Satellite themes)

### Driver Operations
- Driver profiles with ratings, experience, on-time rates
- Mobile-first driver dashboard (480px container)
- Navigation map, delivery list, alerts

### Warehouse Operations
- Capacity cards with progress bars
- Status indicators across 10 major Indian cities

### Analytics
- On-time delivery rate trends
- Delay duration analysis
- Volume trends (line chart)
- Delay causes breakdown (bar chart)
- Priority distribution

### AI Copilot
- Chat interface with session sidebar
- Natural language queries against operational data
- Suggested prompts for common queries

### Settings
- Profile management
- Security (password change)
- Notifications (email, push, SMS)
- Appearance (light/dark/system)
- Integrations (database connections, API keys)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 15.5.19 | App Router with Turbopack |
| React | 19.0.0 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | 3.4.1 | Utility-first styling |
| ShadCN UI | v4.11.0 | Component library (base-nova) |
| Leaflet / React-Leaflet | 1.9.4 / 5.0.0 | Interactive maps |
| Recharts | ^3.8.1 | Analytics charts |
| Zustand | ^5.0.14 | State management |
| React Hook Form + Zod | ^7.78.0 / ^4.4.3 | Form validation |
| Axios | ^1.17.0 | HTTP client |
| Sonner | ^2.0.7 | Toast notifications |
| Lucide React | ^1.17.0 | Icons |
| class-variance-authority | ^0.7.1 | Component variants |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| Express | 5.2.1 | HTTP framework |
| TypeScript | ^6.0.3 | Type safety |
| Mongoose | ^9.7.0 | MongoDB ODM |
| bcrypt | ^6.0.0 | Password hashing |
| jsonwebtoken | ^9.0.3 | JWT authentication |
| Helmet | ^8.2.0 | Security headers |
| cors | ^2.8.6 | Cross-origin requests |
| cookie-parser | ^1.4.7 | Cookie handling |
| pg / mysql2 / mssql | Latest | SQL database drivers (available) |
| redis | ^4.7.0 | Caching layer |

### External APIs

| API | Purpose |
|---|---|
| OpenRouteService (ORS) | Route computation |
| OSRM | Open-source routing fallback |
| OpenWeather | Weather risk assessment |
| Google Maps JavaScript API | Map rendering |

### Databases

| Database | Role |
|---|---|
| MongoDB Atlas | Primary (App DB: `logipilot`, Company DB: `logistics_ops`) |
| Redis | Caching / real-time coordinates |

---

## Design System

### Design Philosophy

LogiPilot AI is inspired by **Stripe Dashboard**, **Linear**, **Notion**, **Vercel**, **Uber Freight**, and **Flexport** — clean, data-driven, enterprise-grade interfaces.

### Brand

- **Name:** LogiPilot AI
- **Tagline:** Predict. Optimize. Deliver.
- **Design Language:** Airbnb-style — clean whites, rounded corners, distinctive coral/pink primary

### Color Palette (CSS Variables)

| Token | Value | Usage |
|---|---|---|
| `--primary` | `#ff385c` (Rausch) | Primary actions, brand |
| `--background` | `#ffffff` | Page background |
| `--foreground` | `#222222` | Primary text |
| `--muted-foreground` | `#6a6a6a` | Secondary text |
| `--secondary` | `#f7f7f7` | Surface/soft backgrounds |
| `--accent` | `#f2f2f2` | Surface-strong |
| `--border` | `#dddddd` | Hairline borders |
| `--destructive` | `#c13515` | Errors, critical alerts |
| `--success` | `#008a05` | Completed states |
| `--info` | `#428bff` | Links, information |

### Shipment Status Colors

| Status | Color |
|---|---|
| Created | `#94A3B8` |
| Dispatched | `#2563EB` |
| In Transit | `#06B6D4` |
| Delivered | `#10B981` |
| Delayed | `#EF4444` |
| Cancelled | `#64748B` |

### Risk Indicators

| Level | Color |
|---|---|
| Low | `#10B981` |
| Medium | `#F59E0B` |
| High | `#EF4444` |

### Typography

| Element | Font | Weight |
|---|---|---|
| Body | Instrument Sans | 400 |
| Headings | Bricolage Grotesque | 500–700 |

### Spacing Scale

Base unit: `4px`

`4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80 · 96`

### Border Radius

| Size | Value |
|---|---|
| sm | 6px |
| md | 8px |
| lg | 10px |
| xl | 14px (cards) |
| 2xl | 16px |
| 3xl | 24px |

### Shadows

| Level | Value |
|---|---|
| Small | `0 1px 2px rgba(0,0,0,.05)` |
| Medium | `0 4px 12px rgba(0,0,0,.08)` |
| Large | `0 10px 25px rgba(0,0,0,.12)` |

### Custom CSS Classes

```css
/* Primary action button */
.btn-primary {
  background: #ff385c;
  color: white;
  border-radius: 8px;
  height: 48px;
  padding: 0 24px;
  font-weight: 500;
  transition: background 0.15s, transform 0.1s;
}
.btn-primary:hover { background: #e00b41; }
.btn-primary:active { transform: scale(0.98); }

/* Airbnb-style search bar */
.search-pill {
  background: white;
  border: 1px solid #dddddd;
  border-radius: 9999px;
  height: 64px;
  padding: 0 24px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Styled input fields */
.input-airbnb {
  background: white;
  border: 1px solid #dddddd;
  border-radius: 8px;
  height: 56px;
  padding: 0 12px;
  color: #222222;
  transition: border 0.15s;
}
.input-airbnb:focus {
  border: 2px solid #222222;
  outline: none;
}

/* Page entrance animation */
.page-enter {
  animation: pageEnter 0.25s ease-out;
}

/* Skeleton loading shimmer */
.skeleton-shimmer {
  background: linear-gradient(90deg, #f7f7f7 25%, #eeeeee 50%, #f7f7f7 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### Animations

| Animation | Duration | Description |
|---|---|---|
| `page-enter` | 250ms | Fade in + translateY(6px → 0) |
| `shimmer` | 1.5s infinite | Loading skeleton gradient sweep |
| `search-popup` | 200ms | Scale(0.9 → 1) + slide up |

---

## Project Structure

```
logipilot/
├── frontend/                     # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/                  # Route pages
│   │   │   ├── layout.tsx        # Root layout (fonts, providers)
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── login/page.tsx    # Login
│   │   │   ├── signup/page.tsx   # Signup
│   │   │   ├── shipments/page.tsx
│   │   │   ├── fleet/page.tsx
│   │   │   ├── drivers/page.tsx
│   │   │   ├── warehouses/page.tsx
│   │   │   ├── analytics/page.tsx
│   │   │   ├── copilot/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   └── driver/           # Driver mobile routes
│   │   │       ├── page.tsx
│   │   │       ├── map/page.tsx
│   │   │       ├── deliveries/page.tsx
│   │   │       └── alerts/page.tsx
│   │   ├── components/           # Shared UI components
│   │   │   ├── ui/               # ShadCN base components
│   │   │   ├── providers/        # AuthProvider
│   │   │   ├── layout/           # TopNav, BottomNav, DriverHeader
│   │   │   └── maps/             # MapWrapper, LiveMap
│   │   ├── features/             # Feature modules
│   │   │   ├── dashboard/        # KPIGrid, MapWrapper, HighRiskTable, AIRecommendations
│   │   │   ├── copilot/          # CopilotWidget
│   │   │   ├── shipments/
│   │   │   ├── fleet/
│   │   │   ├── drivers/
│   │   │   ├── warehouses/
│   │   │   ├── analytics/
│   │   │   └── settings/
│   │   ├── lib/                  # Utilities, API client, cache
│   │   ├── services/             # API service layer
│   │   └── store/                # Zustand stores (auth, etc.)
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   └── components.json           # ShadCN config
│
├── backend/                      # Express.js API
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── seed.ts               # Database seeder
│   │   ├── config/               # Database config
│   │   ├── controllers/          # Route handlers (12 files)
│   │   ├── middlewares/          # Auth + RBAC
│   │   ├── models/               # Mongoose schemas (15 models)
│   │   ├── routes/               # Express routes (12 files)
│   │   ├── services/             # Business logic
│   │   └── utils/                # JWT + crypto helpers
│   ├── package.json
│   └── tsconfig.json
│
├── openrouteservice-main/        # ORS Docker setup
├── specs/                        # Feature specifications
└── logipilot/                    # Product documentation
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Docker (for OpenRouteService, optional)

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/logipilot.git
cd logipilot
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

```bash
cp .env.example .env
```

Edit `backend/.env` with your values (see [Environment Variables](#environment-variables)).

### 4. Seed the Database

```bash
npm run seed
```

Creates:
- 1 admin user (`admin@logipilot.com` / `admin123`)
- 10 warehouses (Indian cities)
- 20 drivers
- 20 vehicles
- 300 shipments
- Feature store entries for ML

### 5. Start the Backend

```bash
npm run dev
# Server running on http://localhost:8000
```

### 6. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 7. Configure Frontend Environment

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=/api
```

### 8. Start the Frontend

```bash
npm run dev
# App running on http://localhost:3000
```

### Scripts Reference

**Backend:**
| Command | Description |
|---|---|
| `npm run dev` | Start dev server (ts-node-dev, port 8000) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Production server |
| `npm run seed` | Seed database with test data |

**Frontend:**
| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack, port 3000) |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | Run ESLint |

---

## Environment Variables

### Backend (`backend/.env`)

```env
# Server
PORT=8000

# Database
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/logipilot

# JWT
JWT_ACCESS_SECRET=your_access_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# External APIs
GOOGLE_WEATHER_API_KEY=your_weather_key
TOMTOM_API_KEY=your_tomtom_key
GOOGLE_MAPS_API_KEY=your_maps_key

# CORS
FRONTEND_URL=http://localhost:3000

# Encryption (for DB connection passwords)
ENCRYPTION_KEY=your_32_char_encryption_key

# Seed target (company database)
SEED_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/logistics_ops

# Routing
ORS_BASE_URL=http://localhost:8080/ors/v2
ORS_API_KEY=
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=/api
```

---

## API Reference

All endpoints are prefixed with `/api`. Authentication uses `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login with email/password |
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/refresh` | Cookie | Refresh access token |
| POST | `/api/auth/logout` | None | Clear refresh token |
| PUT | `/api/auth/profile` | Bearer | Update profile |
| PUT | `/api/auth/change-password` | Bearer | Change password |

### Shipments

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/shipments` | All | List shipments (paginated) |
| GET | `/api/shipments/:id` | All | Get shipment |
| POST | `/api/shipments` | admin/manager/dispatcher | Create shipment |
| PUT | `/api/shipments/:id` | admin/manager/dispatcher | Update shipment |
| DELETE | `/api/shipments/:id` | admin/manager | Delete shipment |
| POST | `/api/shipments/:id/assign-driver` | admin/manager/dispatcher | Assign driver |
| POST | `/api/shipments/:id/assign-vehicle` | admin/manager/dispatcher | Assign vehicle |

### Predictions

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/predictions/delay/:shipmentId` | Delay prediction |
| GET | `/api/predictions/eta/:shipmentId` | ETA prediction |
| GET | `/api/predictions/risk/:shipmentId` | Risk prediction |
| POST | `/api/predictions/batch` | Batch predictions (max 50) |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | KPI statistics |
| GET | `/api/dashboard/high-risk` | High-risk shipments (cached 30s) |

### Map

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/map/overview` | Warehouses + active shipments |
| GET | `/api/map/vehicles` | Vehicle GPS locations |
| POST | `/api/map/route` | Compute route (OSRM/ORS) |
| POST | `/api/map/precompute` | Precompute hub-to-hub routes |
| GET | `/api/map/routes/cached` | Get cached routes |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/summary` | Volume trends, delay causes, priority breakdown |

### Drivers

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/drivers/me` | Current driver profile |
| GET | `/api/drivers` | List all drivers |
| GET | `/api/drivers/:driverId` | Get driver by ID |

### Vehicles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:vehicleId` | Get vehicle by ID |

### Warehouses

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/warehouses` | List all warehouses |
| GET | `/api/warehouses/:warehouseId` | Get warehouse by ID |

### Integrations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/integrations` | List integrations |
| POST | `/api/integrations` | Create integration |
| PUT | `/api/integrations/:id` | Update integration |
| DELETE | `/api/integrations/:id` | Delete integration |
| POST | `/api/integrations/:id/test` | Test database connection |
| POST | `/api/integrations/:id/test-api` | Test API key |

### GPS Tracking

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/gps/report` | Report GPS location |
| GET | `/api/gps/vehicles` | Get vehicle GPS locations |
| GET | `/api/gps/history/:vehicleId` | Get location history |

### Health

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |

---

## Database Schema

### App Database (`logipilot`)

```
User
├── companyId: ObjectId
├── name: string
├── email: string (unique)
├── passwordHash: string (bcrypt)
├── role: 'admin' | 'manager' | 'dispatcher' | 'driver'
├── status: 'active' | 'inactive'
└── preferences: { notifications, appearance }

Integration
├── name: string
├── type: 'database' | 'api'
├── provider: string
├── config: object (encrypted credentials)
└── status: 'active' | 'inactive'
```

### Company Database (`logistics_ops`)

```
Shipment
├── shipmentId: string
├── origin/destination: { name, address, city, coordinates }
├── status: enum (created → dispatched → in transit → delivered/delayed/cancelled)
├── priority: 'low' | 'medium' | 'high' | 'critical'
├── driverId: ObjectId
├── vehicleId: ObjectId
├── estimated/actual delivery dates
├── delayReason: string
└── aiPrediction: { delayProbability, riskScore, eta, confidence }

Driver
├── name, email, phone
├── rating: number
├── experience: number (years)
├── onTimeRate: number
└── status: 'active' | 'inactive'

Vehicle
├── plateNumber, type, model, year
├── capacity: number
├── gpsEnabled: boolean
└── status: 'active' | 'maintenance' | 'inactive'

Warehouse
├── name, address, city, coordinates
├── capacity, currentLoad
├── operatingHours
└── status: 'operating' | 'maintenance' | 'closed'

RouteCache
├── origin/destination coordinates
├── polyline, distance, duration
└── expiresAt: Date

FeatureStore
├── shipmentId, timestamp
├── trafficScore, weatherScore, driverScore
├── vehicleScore, historicalDelayRate
└── isDelayed: boolean
```

---

## Authentication & RBAC

### JWT Dual-Token System

| Token | Lifetime | Storage | Transport |
|---|---|---|---|
| Access Token | 15 minutes | Memory (Zustand) | `Authorization: Bearer` header |
| Refresh Token | 30 days | HttpOnly cookie | `sameSite: strict`, `secure` in prod |

### Auth Flow

```
Register → Auto-login → { accessToken, user } + refresh cookie
Login → Validate credentials → { accessToken, user } + refresh cookie
Refresh → Read cookie → New access token
Logout → Clear cookie
```

### Role Hierarchy

| Role | Permissions |
|---|---|
| `admin` | Full access: CRUD all resources, manage users, delete shipments |
| `manager` | Read all, create/update shipments, assign drivers/vehicles |
| `dispatcher` | Read all, create/update shipments, assign drivers/vehicles |
| `driver` | Read assigned shipments, update delivery status, GPS reporting |

### Frontend Route Protection

- Unauthenticated → `/login`
- Drivers → `/driver` only
- Non-drivers → Cannot access `/driver`

---

## Design Tokens & CSS

### Tailwind Configuration

```typescript
// tailwind.config.ts
{
  darkMode: ["class"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-instrument)', 'sans-serif'],
        display: ['var(--font-bricolage)', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        success: { DEFAULT: 'hsl(var(--success))', foreground: 'hsl(var(--success-foreground))' },
        info: { DEFAULT: 'hsl(var(--info))', foreground: 'hsl(var(--info-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
}
```

### CSS Variables (`globals.css`)

```css
:root {
  --background: 0 0% 100%;        /* #ffffff */
  --foreground: 0 0% 13.3%;       /* #222222 */
  --card: 0 0% 100%;
  --card-foreground: 0 0% 13.3%;
  --primary: 349 100% 61%;        /* #ff385c - Rausch */
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 96.9%;        /* #f7f7f7 */
  --secondary-foreground: 0 0% 13.3%;
  --muted: 0 0% 96.9%;
  --muted-foreground: 0 0% 41.6%; /* #6a6a6a */
  --accent: 0 0% 94.9%;           /* #f2f2f2 */
  --accent-foreground: 0 0% 13.3%;
  --destructive: 11 80% 42%;      /* #c13515 */
  --destructive-foreground: 0 0% 100%;
  --info: 214 100% 63%;           /* #428bff */
  --info-foreground: 0 0% 100%;
  --success: 160 84% 39%;
  --success-foreground: 0 0% 100%;
  --border: 0 0% 86.7%;           /* #dddddd */
  --input: 0 0% 86.7%;
  --ring: 349 100% 61%;
  --radius: 0.5rem;               /* 8px */
}
```

---

## Page Routes

### Desktop (Manager/Admin/Dispatcher)

| Route | Page | Layout |
|---|---|---|
| `/` | Global Operations Center | TopNav + content |
| `/shipments` | Shipment Management | TopNav + content |
| `/fleet` | Fleet Command | TopNav + content |
| `/drivers` | Driver Operations | TopNav + content |
| `/warehouses` | Warehouse Operations | TopNav + content |
| `/analytics` | Analytics & Reports | TopNav + content |
| `/copilot` | AI Copilot | TopNav + content |
| `/settings` | Account Settings | TopNav + content |

### Mobile (Driver)

| Route | Page | Layout |
|---|---|---|
| `/driver` | Driver Home | DriverHeader, 480px container |
| `/driver/map` | Navigation Map | DriverHeader, 480px container |
| `/driver/deliveries` | Delivery List | DriverHeader, 480px container |
| `/driver/alerts` | Alert Notifications | DriverHeader, 480px container |

### Auth

| Route | Page |
|---|---|
| `/login` | Login (Airbnb-style split screen) |
| `/signup` | Registration with role selection |

### Navigation

**Desktop TopNav:** Logo → Dashboard → Fleet → Drivers → Shipments → Warehouses → Analytics → Search Pill → Account Menu

**Mobile BottomNav:** Dashboard → Fleet → (Search FAB) → Shipments → Analytics

**Driver Mobile:** Home → Deliveries → (Search FAB) → Map → Alerts

---

## Deployment

### Docker

```bash
# Backend
cd backend
docker build -t logipilot-backend .
docker run -p 8000:8000 --env-file .env logipilot-backend

# Frontend
cd frontend
docker build -t logipilot-frontend .
docker run -p 3000:3000 --env-file .env.local logipilot-frontend

# OpenRouteService (route computation)
cd openrouteservice-main
docker-compose up -d
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Set secure JWT secrets
- [ ] Enable MongoDB Atlas IP whitelist
- [ ] Configure `ENCRYPTION_KEY` for database passwords
- [ ] Set up OpenRouteService Docker container
- [ ] Configure Google Maps API key with billing
- [ ] Set up Redis for caching
- [ ] Configure SSL/TLS
- [ ] Set up monitoring and logging

---

## Roadmap

### Phase 1 — MVP (Current)
Authentication, RBAC, Shipment/Fleet/Driver management, Live tracking, Traffic/Weather integration, Delay/ETA/Risk prediction, Route optimization, AI Copilot, Notifications

### Phase 2 — Intelligence Expansion (4–8 months)
Warehouse congestion prediction, Vehicle breakdown prediction, Driver fatigue prediction, Fuel analytics, Advanced reporting, Voice copilot, Multilingual support

### Phase 3 — Autonomous Logistics (8–18 months)
Autonomous dispatch planning, Reinforcement learning routing, Digital twin simulation, AI scheduling, Carbon emission optimization

---

## License

Private — All rights reserved.

---

## Support

For issues and feedback: [GitHub Issues](https://github.com/your-org/logipilot/issues)

+ Thought: 119ms
README.md created at the project root with full coverage of:
- Vision & Features — all 8 major feature areas documented
- Tech Stack — frontend, backend, external APIs, databases with versions
- Design System — color palette, typography, spacing, shadows, CSS variables, custom classes (.btn-primary, .search-pill, .input-airbnb, .skeleton-shimmer), animations
- Project Structure — full directory tree with descriptions
- Getting Started — step-by-step setup with scripts reference
- Environment Variables — backend and frontend configs
- API Reference — all 30+ endpoints with methods, paths, auth, and descriptions
- Database Schema — dual-database architecture (app + company DB)
- Auth & RBAC — JWT dual-token system, role hierarchy, route protection
- Design Tokens & CSS — Tailwind config, CSS variables, custom utilities
- Page Routes — desktop, mobile driver, auth pages with navigation structure
- Deployment — Docker setup and production checklist
- Roadmap — 3-phase plan