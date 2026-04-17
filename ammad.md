# StudySphere - Project Setup Summary

**Date:** April 17, 2026  
**By:** Ammad Ahmed

## What Was Done:

### ✅ Tech Stack Finalized
- **Backend:** ASP.NET Core (.NET 8)
- **Frontend:** React + Vite
- **Database:** PostgreSQL (Neon - free hosting)

### ✅ Backend & Frontend Setup
- Created `StudySphere.csproj` with required NuGet packages
- Set up `Program.cs` with EF Core + PostgreSQL configuration
- Created `StudySphereDbContext` for database operations
- Initialized React project with Vite and Axios API client
- Configured dev proxy for local testing

### ✅ Environment Configuration
- Root `.env` - Backend database connection string (Neon PostgreSQL)
- `Frontend/.env` - API endpoint configuration
- `.env.example` files - Templates for teammates (safe to push to git)
- `.gitignore` - Excludes all sensitive `.env` files

## ✅ Module 1: Authentication & Security Schema

### Tables Created:
1. **Student** - Student user account information
   - student_id (PK), email (UNIQUE), password_hash, name, enrollment_number, created_date, last_login, is_active

2. **Admin** - Admin user account information
   - admin_id (PK), email (UNIQUE), password_hash, name, created_date, last_login, is_active

3. **PasswordResetToken** - Password reset token management
   - token_id (PK), student_id/admin_id (FK), token (UNIQUE), expiry_time, is_used, created_date, used_date

### Indexes Created:
- Email indexes on both Student & Admin tables (fast login lookup)
- Token index for password reset validation
- Composite indexes on student_id, admin_id, and expiry_time

### Stored Procedures:
1. **sp_reset_password()** - Reset user password with token validation
2. **sp_validate_reset_token()** - Validate reset token before use
3. **sp_cleanup_expired_tokens()** - Clean up expired tokens (maintenance)

### Database Features:
- ✅ Primary & Foreign Keys for referential integrity
- ✅ CHECK constraints for token ownership (STUDENT XOR ADMIN)
- ✅ Timestamp tracking (created_date, updated_at, last_login)
- ✅ Password hash storage (BCrypt ready)
- ✅ Token expiry validation
- ✅ Test queries for verification

### DBMS Lab Topics Covered:
- DDL: CREATE TABLE, CREATE INDEX, CREATE FUNCTION
- DML: INSERT, UPDATE operations
- Constraints: PK, FK, UNIQUE, NOT NULL, CHECK
- Stored Procedures: Business logic in database
- Query optimization: Indexes for performance

## Next Steps:
- Run SQL files in Neon console (in order: 01 → 02 → 03 → 04)
- Create Entity Framework Core models for tables
- Implement authentication API endpoints
- Build React login/registration components

