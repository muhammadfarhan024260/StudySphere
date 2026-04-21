# StudySphere Auth System - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React)                          │
│  ┌──────────────────────┐         ┌──────────────────────────┐     │
│  │   Login Component    │         │   Signup Component       │     │
│  │ - Role Selection     │         │ - Step 1: Email/Name     │     │
│  │ - Credentials Input  │         │ - Step 2: OTP Verify     │     │
│  │ - JWT Storage        │         │ - Step 3: Password       │     │
│  └──────────────────────┘         └──────────────────────────┘     │
│           │                                    │                    │
│           └────────────────┬───────────────────┘                    │
│                            │                                        │
│                    axios / HTTP API                                 │
│                            │                                        │
└────────────────────────────┼────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND (ASP.NET Core)                         │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │           AuthController                                    │  │
│  │  POST /auth/send-otp                                       │  │
│  │  POST /auth/verify-otp                                     │  │
│  │  POST /auth/signup                                         │  │
│  │  POST /auth/login                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                             │                                      │
│          ┌──────────────────┼──────────────────┐                  │
│          ↓                  ↓                  ↓                  │
│  ┌──────────────────┐ ┌────────────────┐ ┌─────────────────┐   │
│  │AuthService       │ │EmailService    │ │OtpService       │   │
│  │- Password Hashing│ │- SMTP Sending  │ │- OTP Generation │   │
│  │- JWT Generation  │ │- HTML Templates│ │- OTP Validation │   │
│  │- Login Logic     │ │                │ │                 │   │
│  │- Signup Logic    │ └────────────────┘ └─────────────────┘   │
│  └──────────────────┘                                            │
│          │                                                        │
│          ├─→ StudentRepository                                    │
│          │   - GetByEmailAsync                                    │
│          │   - CreateAsync                                        │
│          │   - UpdateAsync                                        │
│          │                                                        │
│          ├─→ AdminRepository                                      │
│          │   - GetByEmailAsync                                    │
│          │   - CreateAsync                                        │
│          │   - UpdateAsync                                        │
│          │                                                        │
│          └─→ OtpRepository                                        │
│              - CreateAsync                                        │
│              - VerifyOtpAsync                                     │
│              - GetLatestUnusedOtpAsync                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                            │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────┐  │
│  │   Student Table  │  │   Admin Table    │  │  OtpVerif...   │  │
│  │ - student_id PK  │  │ - admin_id PK    │  │ - otp_id PK    │  │
│  │ - email UNIQUE   │  │ - email UNIQUE   │  │ - email        │  │
│  │ - password_hash  │  │ - password_hash  │  │ - otp_code     │  │
│  │ - name           │  │ - name           │  │ - user_type    │  │
│  │ - enrollment_num │  │ - last_login     │  │ - is_verified  │  │
│  │ - created_date   │  │ - created_date   │  │ - expiry_time  │  │
│  │ - is_active      │  │ - is_active      │  │ - attempt_count│  │
│  └──────────────────┘  └──────────────────┘  └────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Gmail SMTP Server (smtp.gmail.com:587)                     │  │
│  │  - Sends OTP emails                                         │  │
│  │  - Configured via App Password                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Authentication Flow Diagram

### Signup Flow
```
User (Frontend)
    │
    ├─→ Select Role (Student/Admin)
    │
    ├─→ Enter Email, Name, Enrollment# (for students)
    │
    └─→ [SEND OTP]
            │
            ├─→ AuthController.SendOtp()
            │
            ├─→ AuthService.SendOtpAsync()
            │
            ├─→ OtpService.GenerateAndSendOtpAsync()
            │
            ├─→ Generate 6-digit random OTP
            │
            ├─→ Save to otp_verification table
            │
            ├─→ EmailService.SendOtpEmailAsync()
            │
            ├─→ Connect to SMTP (Gmail)
            │
            ├─→ Send HTML email with OTP
            │
            └─→ Response: "OTP sent successfully"
    
    User receives email with OTP
    
    ├─→ [VERIFY OTP]
    │       │
    │       ├─→ AuthController.VerifyOtp()
    │       │
    │       ├─→ AuthService.VerifyOtpAsync()
    │       │
    │       ├─→ OtpRepository.VerifyOtpAsync()
    │       │
    │       ├─→ Check OTP matches
    │       │
    │       ├─→ Check not expired (15 min)
    │       │
    │       ├─→ Check attempts < 5
    │       │
    │       ├─→ Mark as verified
    │       │
    │       └─→ Response: "OTP verified"
    
    ├─→ Enter Password (confirm)
    │
    └─→ [CREATE ACCOUNT]
            │
            ├─→ AuthController.Signup()
            │
            ├─→ AuthService.SignupAsync()
            │
            ├─→ Validate input (email, password length)
            │
            ├─→ Hash password using BCrypt
            │
            ├─→ StudentRepository.CreateAsync() OR
            │   AdminRepository.CreateAsync()
            │
            ├─→ Save to appropriate table (student/admin)
            │
            ├─→ Generate JWT token (7-day expiry)
            │
            ├─→ Response: {token, userId, userType, redirectUrl}
            │
            └─→ Frontend: Store token in localStorage
                Redirect to /dashboard
```

### Login Flow
```
User (Frontend)
    │
    ├─→ Select Role (Student/Admin) ← IMPORTANT: Determines which table to check
    │
    ├─→ Enter Email & Password
    │
    └─→ [LOGIN]
            │
            ├─→ AuthController.Login()
            │
            ├─→ AuthService.LoginAsync()
            │
            ├─→ IF role == "student"
            │   │
            │   ├─→ StudentRepository.GetByEmailAsync(email)
            │   │
            │   ├─→ If not found → Error: "Invalid credentials"
            │   │
            │   ├─→ VerifyPassword(password, hash)
            │   │
            │   ├─→ BCrypt.Verify() compares password with hash
            │   │
            │   ├─→ If not match → Error: "Invalid credentials"
            │   │
            │   ├─→ Check is_active == true
            │   │
            │   ├─→ Update last_login timestamp
            │   │
            │   └─→ Generate JWT token with studentId
            │
            ├─→ ELSE IF role == "admin"
            │   │
            │   └─→ Same logic but check admin table
            │
            └─→ Response: {token, userId, userType, redirectUrl}
                │
                └─→ Frontend: 
                    - Store token in localStorage
                    - Check userType
                    - Redirect to appropriate dashboard
                      * Student → /dashboard
                      * Admin → /admin-dashboard
```

## Data Models

### Student Model
```csharp
{
  StudentId: int (Primary Key),
  Email: string (Unique),
  PasswordHash: string (BCrypt hashed),
  Name: string,
  EnrollmentNumber: string (Unique, optional),
  CreatedDate: DateTime,
  LastLogin: DateTime?,
  IsActive: bool,
  UpdatedAt: DateTime
}
```

### Admin Model
```csharp
{
  AdminId: int (Primary Key),
  Email: string (Unique),
  PasswordHash: string (BCrypt hashed),
  Name: string,
  CreatedDate: DateTime,
  LastLogin: DateTime?,
  IsActive: bool,
  UpdatedAt: DateTime
}
```

### OtpVerification Model
```csharp
{
  OtpId: int (Primary Key),
  Email: string,
  OtpCode: string (6 digits),
  UserType: string ("student" or "admin"),
  IsVerified: bool,
  CreatedDate: DateTime,
  ExpiryTime: DateTime (15 minutes after creation),
  VerificationDate: DateTime?,
  AttemptCount: int (max 5),
  IsUsed: bool
}
```

## Security Mechanisms

### 1. Password Security
- BCrypt hashing with automatic salt generation
- Passwords never stored in plain text
- Verification uses timing-safe comparison

### 2. OTP Security
- 6-digit random code generation
- 15-minute expiry window
- Attempt limiting (max 5 incorrect attempts)
- One-time use (marked as used after verification)
- Email uniqueness per user type

### 3. JWT Token Security
- Signed with secret key (HS256)
- 7-day expiration
- Contains user ID, email, and role
- Verified on each protected request

### 4. Role-Based Access Control
- Users must select role before login
- Credentials checked against role-specific table
- Only students can login with student credentials
- Only admins can login with admin credentials
- No cross-role authentication possible

### 5. Email Verification
- OTP sent to user's email
- SMTP connection uses TLS/SSL (port 587)
- Only authenticated users can send emails
- Email content includes security warnings

## Configuration Requirements

```
SMTP Configuration:
├─ Host: smtp.gmail.com
├─ Port: 587 (TLS)
├─ Username: Gmail address
├─ Password: 16-character App Password
└─ SenderEmail: Gmail address

JWT Configuration:
├─ Secret: 32+ character random string
├─ Issuer: StudySphere
└─ Audience: StudySphereUsers

Database:
└─ PostgreSQL connection string
   (already configured in .env)
```

## Deployment Considerations

1. **Production HTTPS**: Always use HTTPS in production
2. **Environment Variables**: Keep .env secure, don't commit to Git
3. **CORS Policy**: Configure for specific frontend origin
4. **Rate Limiting**: Implement on auth endpoints
5. **Logging**: Log authentication events and failures
6. **Monitoring**: Monitor OTP delivery and email errors
7. **Backups**: Regular database backups
8. **SSL Certificates**: Use valid certificates for SMTP/API

---

**Generated**: April 20, 2026
**Status**: ✅ Production Ready
