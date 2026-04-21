# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

StudySphere is a student learning platform with a React frontend and ASP.NET Core 8 backend, connected to a PostgreSQL database via Entity Framework Core.

## Tech Stack

- **Backend**: ASP.NET Core 8 Web API (C#), EF Core 8, Npgsql, Swashbuckle (Swagger), DotNetEnv
- **Frontend**: React 18, Vite, React Router v6, Axios
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

Swagger UI is available at `http://localhost:5000/swagger` in development.

### Frontend (run from `Frontend/`)

```bash
npm install     # Install dependencies
npm run dev     # Start Vite dev server on http://localhost:3000
npm run build   # Production build
npm run preview # Preview production build
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so the frontend calls `/api/...` and they reach the .NET backend.

## Environment Setup

**Backend**: Create a `.env` file in the repo root with:
```
connection_string=Host=...;Database=...;Username=...;Password=...
```
Loaded via `DotNetEnv` at startup (`Program.cs:6`).

**Frontend**: Copy `Frontend/.env.example` to `Frontend/.env`. The key variable is `VITE_API_URL` (defaults to `http://localhost:5000/api`).

## Architecture

### Backend

- `Program.cs` — App entry point; registers EF Core (Npgsql), CORS (allow-all), Swagger, and controllers.
- `Data/StudySphereDbContext.cs` — EF Core DbContext; add `DbSet<T>` properties here as entities are defined.
- Controllers go in a `Controllers/` directory (not yet created); they are auto-discovered via `MapControllers()`.
- No authentication middleware is wired up yet — JWT or similar needs to be added to `Program.cs` when implementing auth on the backend.

### Frontend

- `Frontend/src/services/api.js` — Axios instance with base URL, Bearer token injection from `localStorage`, and 401 auto-logout interceptor. All API calls should go through this singleton.
- `Frontend/src/App.jsx` — Root component managing auth state (`isAuthenticated`, `userInfo`) and view switching between `login`, `signup`, and `dashboard` using local state (no router yet).
- `Frontend/src/components/` — Auth components (`Login.jsx`, `Signup.jsx`) POST to `/api/auth/login` and `/api/auth/signup` respectively. After login, `token`, `userId`, and `userType` are stored in `localStorage`.

### Auth Flow (current state)

The frontend expects the backend `/api/auth/login` endpoint to return `{ success, token, userId, userType, name }` and `/api/auth/signup` to return `{ success, message }`. These backend controllers do not exist yet and need to be implemented.

### Enrollment Number Format

Student enrollment numbers follow the pattern `BU-XX-XXX` (e.g., `BU-21-001`), validated on the frontend in `Signup.jsx:52`.
