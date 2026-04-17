-- =====================================================
# StudySphere - Module 1: Authentication & Security
## PostgreSQL Database Schemas
**Date:** April 17, 2026

## Overview
This folder contains the complete database schema for **Module 1: Authentication & Security**, which implements user registration, login, and password reset functionality.

## Database Schema Files

### **File Execution Order:**
1. **01_create_tables.sql** - Create Student, Admin, and PasswordResetToken tables
2. **02_create_indexes.sql** - Create indexes for query optimization
3. **03_stored_procedures.sql** - Create stored procedures for auth workflows
4. **04_seed_data.sql** - Insert sample test data
5. **05_test_queries.sql** - Sample queries for testing
6. **06_drop_all.sql** - Reset everything (use with caution!)

## How to Run in Neon Console

1. Go to [neon.tech](https://neon.tech) and login
2. Open **SQL Editor**
3. Copy content from each `.sql` file (in order above)
4. Paste into the editor and click **Execute**

## Tables Created

### **Student Table**
- Stores student user information
- Fields: student_id, email, password_hash, name, enrollment_number, created_date, last_login, is_active

### **Admin Table**
- Stores admin user information
- Fields: admin_id, email, password_hash, name, created_date, last_login, is_active

### **PasswordResetToken Table**
- Manages password reset tokens with expiry validation
- Fields: token_id, student_id/admin_id (FK), token, expiry_time, is_used, created_date, used_date
- Ensures token uniqueness and one-to-many relationship with users

## Key Features

✅ **DDL Operations** - CREATE TABLE statements with constraints
✅ **Constraints** - Primary Keys, Foreign Keys, UNIQUE, NOT NULL checks
✅ **Indexes** - Optimized query performance on frequently searched columns
✅ **Stored Procedures** - Password reset workflow with token validation
✅ **Data Integrity** - Check constraints ensure only STUDENT or ADMIN owns a token

## DBMS Lab Topics Covered
- DDL: CREATE TABLE, CREATE INDEX
- DML: INSERT, UPDATE operations
- Constraints: PK, FK, UNIQUE, NOT NULL, CHECK
- Stored Procedures: Complex business logic
- Functions: Reusable database functions
