# DevAssist AI — AI Junior Developer

A production-grade, full-stack SaaS application that acts as an AI-powered developer assistant. Upload or paste code to get instant bug analysis, code explanations, unit test generation, and fix suggestions — all powered by Claude AI.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | Zod |
| State | Zustand (frontend) |

---

## Project Structure

```
ai-junior-dev/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Entry point
│   │   ├── app.ts              # Express app setup
│   │   ├── config/
│   │   │   ├── env.ts          # Zod-validated env vars
│   │   │   └── db.ts           # PostgreSQL pool
│   │   ├── routes/             # Express routers
│   │   ├── controllers/        # Request handlers
│   │   ├── services/
│   │   │   ├── ai/             # AI prompt builders & callers
│   │   │   │   ├── provider.service.ts
│   │   │   │   ├── explain.service.ts
│   │   │   │   ├── analyze.service.ts
│   │   │   │   ├── generateTests.service.ts
│   │   │   │   └── suggestFix.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── project.service.ts
│   │   │   ├── file.service.ts
│   │   │   └── run.service.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   └── error.middleware.ts
│   │   ├── validations/        # Zod schemas
│   │   ├── utils/              # JWT, logger, apiResponse, asyncHandler
│   │   └── types/              # Shared TypeScript types
│   ├── migrations/
│   │   ├── 001_init.sql        # Full schema
│   │   └── 002_seed.sql        # Demo data
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── main.tsx
    │   ├── App.tsx             # Routes + auth guards
    │   ├── api/                # Axios API layer
    │   ├── components/
    │   │   ├── ui/             # Button, Badge, Input, Modal, Toast, Spinner
    │   │   ├── layout/         # Sidebar
    │   │   ├── code/           # CodeViewer (syntax highlighting)
    │   │   ├── diff/           # DiffView
    │   │   └── project/        # ExplainPanel, BugPanel, TestPanel, FixPanel
    │   ├── pages/              # LandingPage, LoginPage, RegisterPage, DashboardPage, ProjectPage
    │   ├── hooks/              # useProjects, useFiles
    │   ├── store/              # Zustand auth store
    │   ├── lib/                # Utility functions
    │   └── types/              # Shared TypeScript types
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── .env.example
```

---

## Setup Instructions

### 1. Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Anthropic API key (get one at console.anthropic.com)

### 2. Database Setup

```bash
# Create the database
createdb ai_junior_dev

# Run migrations
psql -U postgres -d ai_junior_dev -f backend/migrations/001_init.sql

# (Optional) Load seed data
psql -U postgres -d ai_junior_dev -f backend/migrations/002_seed.sql
```

### 3. Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY

# Start development server
npm run dev
# → http://localhost:4000
```

### 4. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api

# Start development server
npm run dev
# → http://localhost:5173
```

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | ✓ | Get current user |
| GET | `/api/projects` | ✓ | List user projects |
| POST | `/api/projects` | ✓ | Create project |
| GET | `/api/projects/:id` | ✓ | Get project |
| DELETE | `/api/projects/:id` | ✓ | Delete project |
| GET | `/api/projects/:id/files` | ✓ | List project files |
| POST | `/api/projects/:id/files` | ✓ | Upload/add file |
| GET | `/api/projects/:id/runs` | ✓ | Get run history |
| POST | `/api/ai/explain` | ✓ | Explain code |
| POST | `/api/ai/analyze` | ✓ | Analyze bugs |
| POST | `/api/ai/generate-tests` | ✓ | Generate tests |
| POST | `/api/ai/suggest-fix` | ✓ | Suggest fixes |

---

## AI Response Schemas

### POST /api/ai/explain
```json
{
  "summary": "string",
  "keyFunctions": [{ "name": "string", "description": "string" }],
  "responsibilities": ["string"],
  "riskyAreas": [{ "area": "string", "risk": "string" }]
}
```

### POST /api/ai/analyze
```json
{
  "summary": "string",
  "issues": [{
    "title": "string",
    "severity": "high | medium | low",
    "explanation": "string",
    "affectedArea": "string",
    "suggestedAction": "string"
  }]
}
```

### POST /api/ai/generate-tests
```json
{
  "summary": "string",
  "framework": "Jest",
  "scenarios": [{ "name": "string", "description": "string", "covered": true }],
  "generatedTestCode": "string"
}
```

### POST /api/ai/suggest-fix
```json
{
  "summary": "string",
  "fixes": [{
    "title": "string",
    "explanation": "string",
    "originalCode": "string",
    "suggestedCode": "string",
    "diffSummary": "string"
  }]
}
```

---

## Environment Variables

### Backend `.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | — | `development` / `production` |
| `PORT` | — | Server port (default: 4000) |
| `DATABASE_URL` | * | Full PostgreSQL connection string |
| `JWT_SECRET` | ✓ | Min 16-char secret for signing tokens |
| `JWT_EXPIRES_IN` | — | Token expiry (default: `7d`) |
| `ANTHROPIC_API_KEY` | ✓ | Your Anthropic API key |
| `AI_PROVIDER` | — | `anthropic` (default) or `openai` |
| `FRONTEND_URL` | — | CORS origin (default: `http://localhost:5173`) |

### Frontend `.env`

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (default: `http://localhost:4000/api`) |

---

## Production Deployment

### Backend (Railway / Render / AWS)

```bash
# Build
npm run build

# Start
npm start

# Set environment variables in your platform's dashboard
# Make sure DATABASE_URL points to your hosted PostgreSQL
```

### Frontend (Vercel / Netlify)

```bash
# Build
npm run build

# Output: dist/
# Set VITE_API_URL to your deployed backend URL
```

### Docker (optional)

```dockerfile
# Backend Dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

---

## Demo Credentials

After running `002_seed.sql`:

- **Email:** `demo@devassist.ai`
- **Password:** `demo1234`

---

## Security Notes

- All passwords are bcrypt-hashed (cost factor 12)
- API keys are never exposed to the frontend
- All routes validate input with Zod schemas
- JWT tokens expire after 7 days
- Rate limiting: 100 req/15min globally, 20 req/min on AI routes
- CORS restricted to configured `FRONTEND_URL`
- Helmet.js security headers enabled

---

## Stretch Goals (Future Features)

- [ ] Monaco editor integration
- [ ] GitHub repository import
- [ ] Background job queue (Bull/BullMQ)
- [ ] Docker sandbox for test execution
- [ ] S3/GCS file storage for large codebases
- [ ] Project sharing & collaboration
- [ ] Export generated tests as downloadable files
- [ ] Usage analytics dashboard
- [ ] VS Code extension

---

## License

MIT
