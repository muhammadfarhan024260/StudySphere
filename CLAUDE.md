# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Guidelines

### Think Before Coding

Before implementing, state assumptions explicitly. If multiple interpretations exist, present them — don't pick silently. If something is unclear, stop and ask rather than guess.

### Simplicity First

Minimum code that solves the problem. No features beyond what was asked, no abstractions for single-use code, no speculative flexibility. If a simpler approach exists, say so and push back.

### Surgical Changes

Touch only what the task requires. Don't improve adjacent code or refactor things that aren't broken. Match existing style. If your changes orphan imports/variables/functions, remove them — but leave pre-existing dead code alone unless asked.

### Goal-Driven Execution

For multi-step tasks, state a brief plan with verifiable steps before starting. Define what "done" looks like so progress can be checked independently.

## Project Overview

StudySphere is a student learning platform with a React frontend and ASP.NET Core 8 backend, connected to a PostgreSQL database via Entity Framework Core.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API (C#), EF Core 8, Npgsql, BCrypt.Net-Core, System.IdentityModel.Tokens.Jwt, Swashbuckle, DotNetEnv
- **Frontend**: React 18, Vite 5, React Router v6, Axios, Recharts
- **Database**: PostgreSQL

## Development Commands

### Backend (run from repo root)

```bash
dotnet run              # Start the API on http://localhost:5000
dotnet build            # Build the project
dotnet watch run        # Hot-reload dev server
dotnet ef migrations add <Name>   # Add EF Core migration
dotnet ef database update         # Apply pending migrations
```

Swagger UI: `http://localhost:5000/swagger` in development.

### Frontend (run from `Frontend/`)

```bash
npm install     # Install dependencies
npm run dev     # Start Vite dev server on http://localhost:3000
npm run build   # Production build
```

The Vite dev server proxies `/api` to `http://localhost:5000`.

## Environment Setup

**Backend** — `.env` in repo root:
```
connection_string=Host=...;Database=...;Username=...;Password=...
ASPNETCORE_URLS=http://localhost:5000
SMTP:Host=smtp.gmail.com
SMTP:Port=587
SMTP:Username=...
SMTP:Password=...       # Gmail App Password
SMTP:SenderEmail=...
JWT:Secret=...          # min 32 chars
JWT:Issuer=StudySphere
JWT:Audience=StudySphereUsers
```

**Frontend** — `Frontend/.env` (copy from `.env.example`): `VITE_API_URL` defaults to `/api`.

## Architecture

### Backend Layers

`Program.cs` registers EF Core, JWT Bearer auth, CORS (allow-all), Swagger, and all DI services.

The backend uses a layered pattern:
- **Controllers** → inject Services/Façades, return HTTP responses
- **Façades** (`Facades/StudyPlannerFacade.cs`) → orchestrate complex multi-repository workflows (used by `StudyLogController`)
- **Services** → business logic (auth, OTP, email, intelligence, goals, study logs)
- **Repositories** → data access via EF Core
- **`Data/StudySphereDbContext.cs`** → 9 `DbSet<T>` entities; contains a custom `SavingChanges` hook to normalize `DateTime.Kind` to UTC for Npgsql

### API Endpoints

| Controller | Base Route | Auth |
|---|---|---|
| `AuthController` | `/api/auth` | Public |
| `StudyLogController` | `/api/studylog` | `[Authorize]` |
| `SubjectController` | `/api/subject` | `[Authorize]` |
| `AdminController` | `/api/admin` | `[Authorize(Roles="Admin")]` |
| `IntelligenceController` | `/api/intelligence` | `[Authorize]` |

Key auth endpoints: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`, `POST /api/auth/signup`, `POST /api/auth/login`.

Login/signup return `{ success, token, userId, userType, name }`. Token is a JWT with a `role` claim (`Student` or `Admin`).

### Database Schema

9 tables: `student`, `admin`, `otp_verification`, `subject`, `study_log`, `goal`, `weak_area`, `notification`, `recommendation`.

`weak_area` is auto-populated by a PostgreSQL trigger on `study_log` INSERT — do not write to it directly from application code.

### Frontend Architecture

`App.jsx` uses React Router v6 with these routes:
- `/` → `HomePage`
- `/login` → `Login`
- `/signup` → `Signup` (3-step wizard: email/name → OTP → password)
- `/dashboard` → `StudentDashboard`
- `/admin` → `AdminDashboard`

`Frontend/src/services/api.js` is the sole Axios instance. It injects the JWT Bearer token from `localStorage` on every request and auto-redirects to `/` on 401. All components must use this singleton — never create ad-hoc Axios instances.

Data fetching is encapsulated in custom hooks under `Frontend/src/hooks/`:
- `useStudyData.js` — student-facing hooks (`useStudyLogs`, `useGoals`, `useWeakAreas`, `useNotifications`, `useRecommendations`, `useLogSession`, `useCreateGoal`)
- `useAdminData.js` — admin-facing hooks (`useAllRecommendations`, `useAnalyticsData`, `useStudentPerformance`)

After login, `token`, `userId`, and `userType` are stored in `localStorage`. `userType` is `"Student"` or `"Admin"`.

### Auth Flow

1. Signup: email → `POST /auth/send-otp` (Gmail SMTP, 6-digit OTP, 10-min TTL, 3 max attempts) → `POST /auth/verify-otp` → `POST /auth/signup` (BCrypt-hashed password)
2. Login: `POST /auth/login` → JWT returned → stored in `localStorage`
3. Protected routes: JWT sent as `Authorization: Bearer <token>` header (injected by `api.js`)

Student enrollment numbers follow `BU-XX-XXX` format, validated in `Signup.jsx`.

## Known Incomplete Areas

- `useWeakAreaStats()` in `useAdminData.js` returns mock data (no backend endpoint yet)
- `AdminController.GetAnalyticsOverview()` returns hardcoded mock data
- Some AdminDashboard tabs (Reports, Performance) have UI stubs with no real data
