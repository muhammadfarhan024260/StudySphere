# Module 2: Study Logging - Status Report
**Owner:** Shafaq
**Status:** Implementation Completed

This document summarizes the DBMS and Software Design Architecture (SDA) implementation for the Study Logging module.

## 🗄️ DBMS Layer (PostgreSQL)

The database schema has been designed using a **snake_case** naming convention to ensure 100% consistency with the existing Auth & Security module.

### 1. Unified Schema
- **Tables Created:**
  - `subject`: Manages academic subjects and target hours.
  - `study_log`: Tracks individual study sessions, durations, and productivity scores.
  - `goal`: Handles weekly/monthly targets for students.
- **Relationships:** Established foreign keys from `study_log` and `goal` to the primary `student(student_id)` table.
- **Indexing:** 
  - `idx_study_log_student_id`: Optimized for pulling student history.
  - `idx_study_log_subject_id`: Optimized for subject-based analytics.

### 2. Available Scripts
- **Location:** `database/study_logging.sql`
- Contains: DDL (Tables), Indexing, DML (Insert/Update/Delete samples), and complex JOIN queries.

---

## 🏗️ SDA Layer (.NET Core)

The implementation follows a strict **3-Tier Architecture** and utilizes the **Façade Pattern**.

### 1. Architectural Tiers
- **Presentation Layer:** 
  - `StudyLogController`: Exposes endpoints for logging sessions, setting goals, and retrieving history.
- **Business Layer:** 
  - `StudyLogService` & `GoalService`: Process business logic and coordination.
- **Data Access Layer:** 
  - `StudyLogRepository` & `GoalRepository`: Handle direct communication with PostgreSQL using raw **Npgsql** (ADO.NET) for maximum performance.

### 2. Design Patterns
- **Façade Pattern:** Implemented via `StudyPlannerFacade`. This class simplifies interactions by providing a single point of entry for the controller, hiding the complexity of underlying services.

### 3. Key Components
- **Models:** Domain entities mapped to the database (`StudyLog.cs`, `Goal.cs`, `Subject.cs`).
- **Dependency Injection:** All repositories, services, and the facade are registered in `Program.cs`.

---

## 📂 Project Structure
```text
StudySphere/
├── Controllers/
│   └── StudyLogController.cs
├── Facades/
│   └── StudyPlannerFacade.cs
├── Services/
│   ├── IStudyLogService.cs / StudyLogService.cs
│   └── IGoalService.cs / GoalService.cs
├── Repositories/
│   ├── IStudyLogRepository.cs / StudyLogRepository.cs
│   └── IGoalRepository.cs / GoalRepository.cs
├── Models/
│   ├── StudyLog.cs
│   ├── Goal.cs
│   └── Subject.cs
└── database/
    └── study_logging.sql
```

## ✅ Completed Tasks
- [x] Schema design with snake_case consistency.
- [x] SQL scripts for all CRUD operations.
- [x] 3-Tier backend implementation.
- [x] Façade Pattern integration.
- [x] Dependency Injection registration.

