# ✅ Todo App

A minimalist, high-UI task manager built with **React**, **Hono**, **Drizzle ORM**, and **SQLite**. Deploys anywhere: Docker, Cloudflare, Vercel, or bare metal.

## Features

- 🎯 **Drag & drop** task reordering
- 🏷 **Categories** with custom colors and icons
- 🌙 **Dark mode** with smooth transitions
- 📅 **Due dates & start dates** with smart alerts
- 📝 **Notes** on every task
- ⚡ **Alerts** for overdue and upcoming tasks
- 🔍 **Search & filter** by category, priority, status
- 📱 **Responsive** — works on mobile and desktop

## Tech Stack

| Layer    | Tech                              |
| -------- | --------------------------------- |
| Frontend | React 18 + Vite + Tailwind CSS   |
| Backend  | Hono (runs on Node, CF Workers)  |
| Database | SQLite via Drizzle ORM (+ D1)    |
| DnD      | @dnd-kit                          |
| State    | Zustand                           |
| Deploy   | Docker / Cloudflare / Vercel     |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+ (`corepack enable && corepack prepare pnpm@9 --activate`)

### Development

```bash
# Clone and install
git clone <your-repo-url> todo-app
cd todo-app
pnpm install

# Start dev servers (API on :3000, Frontend on :5173)
pnpm dev
```

Open http://localhost:5173. The frontend proxies API calls to `:3000` automatically.

---

## Deploy Options

### 🐳 Option 1: Docker (Recommended for self-hosting)

```bash
# Build and run
docker compose up -d --build

# App available at http://localhost:3000
```

Data persists in a Docker volume (`todo-data`). To backup:

```bash
docker cp todo-app:/app/data/todo.db ./backup.db
```

### ☁️ Option 2: Cloudflare (Workers + D1 + Pages)

```bash
# 1. Create the D1 database
cd packages/api
npx wrangler d1 create todo-db

# 2. Copy the database_id to wrangler.toml

# 3. Run migrations on D1
npx wrangler d1 execute todo-db --file=./migrations/0000_init.sql

# 4. Build frontend
cd ../web
pnpm build

# 5. Deploy
cd ../api
npx wrangler deploy
```

### 🔺 Option 3: Vercel / Netlify

```bash
# Build the frontend
cd packages/web
pnpm build
# Deploy the `dist` folder to Vercel/Netlify

# For the API, deploy packages/api as a separate service
# or use Vercel Serverless Functions
```

### 🖥 Option 4: Bare Metal / VPS

```bash
# Build everything
pnpm build

# Run the production server
cd packages/api
NODE_ENV=production DATABASE_URL=/path/to/todo.db STATIC_DIR=../web/dist node dist/server.js
```

---

## Project Structure

```
todo-app/
├── docker-compose.yml        # Docker deployment
├── Dockerfile                # Multi-stage build
├── package.json              # Root workspace
├── pnpm-workspace.yaml
│
├── packages/
│   ├── api/                  # Backend
│   │   ├── src/
│   │   │   ├── app.ts        # Hono app factory
│   │   │   ├── server.ts     # Node.js entry
│   │   │   ├── worker.ts     # Cloudflare Worker entry
│   │   │   ├── db/
│   │   │   │   ├── schema.ts # Drizzle schema
│   │   │   │   ├── connection.ts
│   │   │   │   ├── migrate.ts
│   │   │   │   └── seed.ts
│   │   │   └── routes/
│   │   │       ├── tasks.ts
│   │   │       └── categories.ts
│   │   ├── migrations/
│   │   └── wrangler.toml     # CF Workers config
│   │
│   └── web/                  # Frontend
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   ├── components/
│       │   │   ├── Alerts.tsx
│       │   │   ├── Fab.tsx
│       │   │   ├── FilterBar.tsx
│       │   │   ├── Header.tsx
│       │   │   ├── TaskCard.tsx
│       │   │   ├── TaskList.tsx
│       │   │   └── TaskModal.tsx
│       │   ├── hooks/
│       │   │   └── useStore.ts   # Zustand store
│       │   ├── lib/
│       │   │   ├── api.ts        # API client
│       │   │   └── utils.ts
│       │   └── types/
│       │       └── index.ts
│       └── tailwind.config.js
```

## API Endpoints

| Method | Path                    | Description          |
| ------ | ----------------------- | -------------------- |
| GET    | `/api/health`           | Health check         |
| GET    | `/api/tasks`            | List tasks (filtered)|
| POST   | `/api/tasks`            | Create task          |
| GET    | `/api/tasks/:id`        | Get task             |
| PUT    | `/api/tasks/:id`        | Update task          |
| DELETE | `/api/tasks/:id`        | Delete task          |
| PUT    | `/api/tasks/batch/reorder` | Reorder tasks     |
| GET    | `/api/tasks/stats/summary` | Task statistics   |
| GET    | `/api/categories`       | List categories      |
| POST   | `/api/categories`       | Create category      |
| PUT    | `/api/categories/:id`   | Update category      |
| DELETE | `/api/categories/:id`   | Delete category      |

### Query Parameters for `GET /api/tasks`

- `category` — Filter by category ID
- `completed` — `true` or `false`
- `search` — Full-text search in title and notes
- `priority` — `low`, `medium`, `high`
- `sort` — `position`, `due_date`, `created`, `priority`

## License

MIT
