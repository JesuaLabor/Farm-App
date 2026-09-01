# AgriConnect 🌾

A full-stack agricultural platform connecting farmers, buyers, suppliers, experts, and LGU staff across the Philippines.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Go 1.26 · Chi router · MongoDB 8 |
| Web | React 18 · Vite · TypeScript · Outfit font |
| Mobile | React 18 · Vite · TypeScript PWA (Workbox) |
| Auth | JWT (Bearer tokens) · bcrypt |
| Shared | TypeScript API client (`packages/api-client`) |

## Project Structure

```
Farmers_App/
├── backend/                # Go REST API (port 8080)
│   ├── cmd/api/main.go     # Entrypoint
│   ├── internal/
│   │   ├── config/         # Env-based configuration
│   │   ├── database/       # MongoDB connection
│   │   ├── handler/        # HTTP handlers (auth, produce, supply, …)
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/         # Data models
│   │   ├── repository/     # DB access layer
│   │   ├── router/         # Chi route definitions
│   │   └── service/        # Business logic
│   ├── .env                # Local secrets (git-ignored)
│   └── .env.example        # Template — copy to .env
├── web/                    # React (Vite) web app (port 5173)
│   └── src/
│       ├── api/            # Typed API clients
│       ├── components/     # Navbar, PriceChart, guards
│       ├── contexts/       # AuthContext
│       ├── pages/          # 19 role-scoped pages
│       └── index.css       # Design system (tokens, components)
├── mobile/                 # React Native (Expo) mobile app
│   └── src/
│       ├── api/            # Axios client (auto-switches LAN IP vs emulator)
│       ├── contexts/       # AuthContext
│       ├── screens/        # Login, Register, Dashboard, Profile
│       ├── theme.ts        # Shared design tokens (mirrors web palette)
│       └── types/
└── packages/
    └── api-client/         # Shared TypeScript API client
```

## Getting Started

### Prerequisites

| Tool | Minimum version |
|------|----------------|
| Go | 1.21+ |
| Node.js | 18+ |
| MongoDB | 6+ (local or Atlas) |
| Expo Go (iOS/Android) | Latest from App Store / Play Store |

---

### 1. Backend

```bash
cd backend

# First time: copy env template and fill in your values
cp .env.example .env
```

Edit `.env`:
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=agriconnect
JWT_SECRET=<generate with: openssl rand -hex 32>
JWT_EXPIRY_HOURS=24
PORT=8080
UPLOAD_DIR=./uploads
```

**Start MongoDB (CachyOS / Arch):**
```bash
# First time setup
sudo mkdir -p /var/lib/mongodb /var/log/mongodb
sudo chown -R $USER:$USER /var/lib/mongodb /var/log/mongodb

# Start (or use systemd if configured)
mongod --dbpath /var/lib/mongodb --logpath /var/log/mongodb/mongod.log --fork
```

**Run the API:**
```bash
go run ./cmd/api
# ✅ Connected to MongoDB
# 🚀 AgriConnect API starting on http://localhost:8080
```

---

### 2. Web App

```bash
cd web
npm install
npm run dev
# → http://localhost:5173
```

The web app proxies API calls to `localhost:8080`. Make sure the backend is running first.

---

### 3. Mobile PWA (Progressive Web App)

**Install and start:**
```bash
cd mobile
npm install
npm run dev
# → http://localhost:5174
```

**Open on your phone:**
1. Make sure your phone and computer are on the **same Wi-Fi** network.
2. Open Chrome (Android) or Safari (iOS) and navigate to `http://<YOUR_LAN_IP>:5174`.
3. Tap **"Add to Home Screen"** or **"Install App"** to install AgriConnect as a standalone mobile application.

---

## User Roles

| Role | Description | Key Features |
|------|-------------|-------------|
| `farmer` | Agricultural producer | Crop listings, market prices, farm finances, community |
| `buyer` | Produce buyer | Browse listings, purchase, supply store, orders |
| `supplier` | Input supplier | Manage supply catalog, fulfill orders |
| `expert` | Agricultural expert | Community Q&A, government programs |
| `lgu_staff` | Local government unit | Program management, LGU dashboard, price monitoring |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/users/me` | ✅ | Get current user profile |
| PUT | `/api/users/me` | ✅ | Update profile |
| GET | `/api/produce/listings` | ✅ | List produce marketplace |
| POST | `/api/produce/listings` | ✅ Farmer | Create listing |
| GET | `/api/supply/products` | ✅ | Browse supply store |
| GET | `/api/prices` | ✅ | Market price monitoring |
| GET | `/api/programs` | ✅ | Government programs |
| GET | `/api/community/posts` | ✅ | Community forum posts |
| GET | `/api/financial/entries` | ✅ Farmer | Farm financial tracker |

---

## Design System

The web app uses a custom design system defined in [`web/src/index.css`](web/src/index.css):

- **Font:** Outfit (300–800) + Geist Mono for data/numbers
- **Palette:** Forest green (`#2d8a4e`) + warm earth tones
- **Shadows:** Green-tinted (not generic black)
- **Tokens:** `--color-accent`, `--shadow-md`, `--radius-lg`, etc.

The mobile app mirrors this via [`mobile/src/theme.ts`](mobile/src/theme.ts).

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable releases |
| `feat/apply-skill` | Active development — redesign + backend config |

---

## License

Private project. All rights reserved.