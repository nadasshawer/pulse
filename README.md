# 📈 Pulse: Mini Logging & Monitoring System

<p align="left">
  <img src="https://img.shields.io/badge/Status-Work%20in%20Progress-ff6b6b?style=for-the-badge&logo=github&logoColor=white" />
  <img src="https://img.shields.io/badge/Type-Logging%20%26%20Monitoring-e85d04?style=for-the-badge&logo=grafana&logoColor=white" />
  <img src="https://img.shields.io/badge/Language-TypeScript-3178c6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/API-Fastify-09BFAA?style=for-the-badge&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Target-Linux%20Homelab-FCC624?style=for-the-badge&logo=linux&logoColor=black" />
</p>

**Pulse** is a **mini logging and monitoring system** designed to run on real traffic from a **self-hosted Linux homelab**. A Node agent collects host telemetry (CPU and memory today, with room to grow into broader logs/events), a Fastify + PostgreSQL API stores data and evaluates alert rules, and a React dashboard surfaces what’s happening across your machines.

Same shape as tools like Datadog or Grafana — projects, API keys, metrics ingest, threshold alerts, persisted alert history, automated tests, and CI — at homelab scale you can actually own and extend.

---

## 🛠️ Tech Stack & Core Libraries

**API & Data**

<p align="left">
  <img src="https://img.shields.io/badge/Fastify-5-09BFAA?style=flat-square&logo=fastify&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-7-5A67D8?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/TypeScript-7-3178c6?style=flat-square&logo=typescript&logoColor=white" />
</p>

**Agent & Frontend**

<p align="left">
  <img src="https://img.shields.io/badge/Node.js-Agent-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Linux-Homelab-FCC624?style=flat-square&logo=linux&logoColor=black" />
</p>

**Quality & CI**

<p align="left">
  <img src="https://img.shields.io/badge/Jest-30-C21325?style=flat-square&logo=jest&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-CI-2088FF?style=flat-square&logo=githubactions&logoColor=white" />
</p>

---

## 🛠️ Key Features

### 1. Metrics Ingest Pipeline

- Node agent reports **CPU** and **memory** on a fixed interval.
- `POST /metrics` authenticates with a per-project **API key**.
- Metrics are stored in PostgreSQL with hostname, value, and timestamp.
- Query with optional `projectId`, `from`, and `to` time-range filters.
- `GET /metrics/latest` returns the newest point per hostname + metric name.

### 2. Projects & API Keys

- `POST /projects` creates a project and returns an `apiKey` once.
- `GET /projects` lists projects without exposing secrets.
- Agents and clients authenticate metric writes via the `X-Api-Key` header.

### 3. Alert Rules & Events

- Define threshold rules (`gt`, `lt`, `gte`, `lte`, `eq`) per project and metric name.
- On every metric ingest, matching rules are evaluated.
- Fired rules are persisted as **alert events** (metric + rule + `firedAt`).
- `GET /alert-events?projectId=` lists firing history for a project.

### 4. Tests & Continuous Integration

- Jest + Fastify `inject` integration tests for health, projects, metrics, alert rules, and alert events.
- GitHub Actions runs install, Prisma generate/migrate, and `npm test` against Postgres on every push/PR to `main`.

---

## 📋 Usage Guide

### Main API routes

| Method     | Path              | Purpose                                     |
| :--------- | :---------------- | :------------------------------------------ |
| GET        | `/health`         | Liveness check                              |
| POST / GET | `/projects`       | Create / list projects                      |
| POST / GET | `/metrics`        | Ingest / list metrics (`X-Api-Key` on POST) |
| GET        | `/metrics/latest` | Latest metrics per host + name              |
| POST / GET | `/alert-rules`    | Create / list alert rules                   |
| GET        | `/alert-events`   | List persisted alert firings                |

### Example: create a project

```bash
curl.exe -X POST http://localhost:5000/projects ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"homelab\"}"
```

### Example: send a metric

```bash
curl.exe -X POST http://localhost:5000/metrics ^
  -H "Content-Type: application/json" ^
  -H "X-Api-Key: YOUR_API_KEY" ^
  -d "{\"name\":\"memory_metric\",\"value\":92.5,\"hostname\":\"Nada\"}"
```

### Example: list alert events

```bash
curl.exe "http://localhost:5000/alert-events?projectId=1"
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 24+ (recommended; matches CI)
- PostgreSQL running locally
- Git

### 1. Clone the repository

```bash
git clone https://github.com/nadasshawer/pulse.git
cd pulse
```

### 2. Configure and run the API

```bash
cd api
cp .env.example .env
# Set DATABASE_URL (and optional PORT; default is 5000)
npm install
npx prisma migrate deploy
npx prisma generate
npm run dev
```

### 3. Create a project and copy the API key

Use the `POST /projects` curl above (or your HTTP client). Save the returned `apiKey`.

### 4. Run the agent

```bash
cd agent
cp .env.example .env
# Set API_URL=http://localhost:5000 and API_KEY=<your key>
npm install
npm run dev
```

### 5. (Optional) Run the web dashboard

```bash
cd web
# Set VITE_API_URL=http://localhost:5000 in a .env file
npm install
npm run dev
```

### 6. Run API tests

```bash
cd api
npm test
```

**Note:** Tests need a reachable `DATABASE_URL` (same as local dev). CI provisions its own Postgres service.

---

## 🏗️ Technical Architecture

Pulse is split into three apps that talk over HTTP:

- **agent/** — Collects host CPU/memory and POSTs metrics to the API with an API key.
- **api/** — Fastify routes, Prisma/PostgreSQL, alert evaluation on ingest, Jest tests.
- **web/** — Vite + React dashboard (metrics table today; expanding next).

**API internals (high level):**

- `src/app.ts` — App factory, CORS, error handler, route registration.
- `src/routes/` — HTTP endpoints (metrics, projects, alert rules, alert events, health).
- `src/services/alertRules.service.ts` — Threshold evaluation (`checkAlerts`).
- `prisma/` — Schema and migrations (`Project`, `Metric`, `AlertRule`, `AlertEvent`).
- `tests/` — Integration tests via Fastify `inject`.

```text
Host (agent) --POST /metrics + X-Api-Key--> API --Prisma--> PostgreSQL
                                              |
                                              +--> checkAlerts --> alert_events
                                              |
Web (React)  --GET /metrics, /alert-events--> API
```

---

## 📁 Project Structure

```text
pulse/
├── .github/workflows/     # API CI (Postgres + migrate + Jest)
├── api/                   # Fastify API
│   ├── prisma/            # Schema + migrations
│   ├── src/
│   │   ├── routes/        # HTTP route modules
│   │   ├── services/      # Alert evaluation
│   │   ├── app.ts         # buildApp()
│   │   └── server.ts      # Listen on PORT
│   └── tests/             # Integration tests
├── agent/                 # CPU/memory collector
├── web/                   # React dashboard
├── .gitignore
└── README.md              # You are here!
```

---

## 📈 Roadmap

- [x] **Milestone 1**: Metrics API + Postgres + agent ingest
- [x] **Milestone 2**: Projects, API keys, time-range queries
- [x] **Milestone 3**: Alert rules, evaluation, alert event persistence
- [x] **Milestone 4**: Jest suite + GitHub Actions CI (**base v1**)
- [ ] **Milestone 5**: Frontend dashboard (metrics, latest, alert history)
- [ ] **Milestone 6**: Deploy agent on self-hosted Linux homelab
- [ ] **Milestone 7**: Alert lifecycle (firing / resolved) + webhooks
- [ ] **Milestone 8**: Auth, Docker Compose, fuller log ingest

---

## 💡 Pro-Tips

### Prisma after pulling

If migrations changed on `main`:

```bash
cd api
npx prisma migrate deploy
npx prisma generate
```

### Windows curl

Prefer `curl.exe` in PowerShell so you don’t hit the `curl` alias for `Invoke-WebRequest`.
