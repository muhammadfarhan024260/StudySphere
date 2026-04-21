# StudySphere Authentication System Implementation Guide

## Overview

The authentication system has been fully implemented with OTP-based email verification for signup and role-based login. The system supports two user types: **Students** and **Admins**.

## Features Implemented

### 1. **OTP-Based Email Verification Signup**
   - Users provide name, email, and enrollment number (for students)
   - System generates and sends 6-digit OTP to user's email
   - User verifies OTP (15-minute expiry)
   - After OTP verification, user creates password
   - Account is created in the appropriate table (student/admin)
   - User is redirected to dashboard

### 2. **Role-Based Login**
   - Users select their role: Student or Admin
   - Login credentials are validated against the selected role's table
   - Students login with student credentials (checked against student table)
   - Admins login with admin credentials (checked against admin table)
   - JWT tokens are generated for authenticated users
   - Users are redirected to their respective dashboards

### 3. **Security Features**
   - Passwords are hashed using BCrypt
   - JWT tokens with 7-day expiry
   - OTP attempt limiting (max 5 attempts)
   - Email uniqueness enforcement
   - Token-based API authentication

## Technology Stack

### Backend
- **Framework**: ASP.NET Core 8.0
- **Database**: PostgreSQL (Neon)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt.Net-Core
- **Email**: SMTP

### Frontend
- **Framework**: React
- **State Management**: React Hooks
- **HTTP Client**: Axios

## Database Schema

### Tables Created

#### 1. `student` table
```sql
- student_id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- name
- enrollment_number (UNIQUE)
- created_date
- last_login
- is_active
- updated_at
```

#### 2. `admin` table
```sql
- admin_id (PRIMARY KEY)
- email (UNIQUE)
- password_hash
- name
- created_date
- last_login
- is_active
- updated_at
```

#### 3. `otp_verification` table
```sql
- otp_id (PRIMARY KEY)
- email
- otp_code (6-digit)
- user_type (student/admin)
- is_verified
- created_date
- expiry_time (15 minutes)
- verification_date
- attempt_count
- is_used
```

## API Endpoints

### Authentication Endpoints

#### 1. Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "User Name",
  "userType": "student" // or "admin"
}

Response:
{
  "success": true,
  "message": "OTP sent to your email successfully"
}
```

#### 2. Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "userType": "student" // or "admin"
}

Response:
{
  "success": true,
  "message": "OTP verified successfully"
}
```

#### 3. Signup (Create Account)
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "User Name",
  "userType": "student",
  "enrollmentNumber": "BU-21-001" // Only for students
}

Response:
{
  "success": true,
  "message": "Account created successfully",
  "token": "JWT_TOKEN_HERE",
  "userId": 1,
  "userType": "student",
  "redirectUrl": "/dashboard"
}
```

#### 4. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "userType": "student" // or "admin"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "userId": 1,
  "userType": "student",
  "redirectUrl": "/dashboard"
}
```

## Configuration Setup

### 1. Environment Variables (.env file)

You need to configure the following variables in your `.env` file:

```env
# Database Connection
connection_string=postgresql://user:password@host/database?sslmode=require

# SMTP Configuration for Email OTP
SMTP:Host=smtp.gmail.com
SMTP:Port=587
SMTP:Username=your_email@gmail.com
SMTP:Password=YOUR_APP_PASSWORD  # NOT your Gmail password
SMTP:SenderEmail=your_email@gmail.com

# JWT Configuration
JWT:Secret=your-super-secret-jwt-key-minimum-32-characters-long
JWT:Issuer=StudySphere
JWT:Audience=StudySphereUsers

# Server Configuration
ASPNETCORE_ENVIRONMENT=Development
ASPNETCORE_URLS=http://localhost:5000
```

### 2. Gmail SMTP Setup

To use Gmail for sending OTP emails:

1. **Enable 2-Step Verification**:
   - Go to myaccount.google.com
   - Select Security from the left menu
   - Enable 2-Step Verification

2. **Generate App Password**:
   - Go to myaccount.google.com/apppasswords
   - Select "Mail" and "Windows Computer" (or your device)
   - Google will generate a 16-character password
   - Copy this password and use it as `SMTP:Password` in `.env`

3. **Set SMTP Configuration**:
   ```env
   SMTP:Host=smtp.gmail.com
   SMTP:Port=587
   SMTP:Username=your_email@gmail.com
   SMTP:Password=xxxx xxxx xxxx xxxx  # 16-char app password
   SMTP:SenderEmail=your_email@gmail.com
   ```

### 3. Generate JWT Secret

Generate a strong JWT secret (at least 32 characters):

```bash
# Using PowerShell
$secret = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..32 | ForEach-Object {[char][int]([System.Security.Cryptography.RandomNumberGenerator]::new()).GetBytes(1)[0]}) -join ''))
Write-Host $secret
```

Or use an online generator: https://www.random.org/cgi-bin/randbytes?nbytes=32&format=h

## Frontend Implementation

### Authentication Flow - Signup

**Step 1**: User enters name, email, and enrollment number (for students)
↓
**Step 2**: System sends OTP to email
↓
**Step 3**: User enters 6-digit OTP received in email
↓
**Step 4**: System verifies OTP
↓
**Step 5**: User creates password
↓
**Step 6**: Account is created in database
↓
**Step 7**: JWT token is issued
↓
**Step 8**: User is redirected to dashboard

### Authentication Flow - Login

**Step 1**: User selects role (Student or Admin)
↓
**Step 2**: User enters email and password
↓
**Step 3**: System validates credentials against selected role's table
↓
**Step 4**: If valid, JWT token is issued
↓
**Step 5**: User is redirected to their dashboard

## Frontend Components

### 1. Login Component (`Login.jsx`)
- Role selection (Student/Admin)
- Email and password input
- Role-based validation
- Token storage in localStorage
- Automatic redirection to dashboard

### 2. Signup Component (`Signup.jsx`)
- 3-step OTP verification process
- Step indicator showing progress
- Email and enrollment number input
- OTP verification with resend option
- Password creation with confirmation
- Role selection (Student/Admin)
- Automatic redirection after account creation

## Running the Application

### Backend

1. **Install NuGet Packages**:
```bash
dotnet restore
```

2. **Update Database** (run SQL scripts):
   - Execute `database/postgresql/01_create_tables.sql`
   - Execute `database/postgresql/02_create_indexes.sql`

3. **Run the Backend**:
```bash
dotnet run
```
Backend will be available at: `http://localhost:5000`

### Frontend

1. **Install Dependencies**:
```bash
cd Frontend
npm install
```

2. **Run Development Server**:
```bash
npm run dev
```
Frontend will be available at: `http://localhost:5173` (default Vite port)

## Testing the System

### Test Signup Flow

1. Navigate to signup page
2. Select "Student" role
3. Enter test data:
   - Name: "Test Student"
   - Enrollment: "BU-21-TEST"
   - Email: "test@gmail.com"
4. Click "Send Verification Code"
5. Check Gmail inbox for OTP
6. Enter OTP in verification field
7. Create password (min 6 characters)
8. Should be redirected to dashboard

### Test Login Flow

1. Navigate to login page
2. Select "Student" role
3. Enter credentials from signup
4. Should be logged in and redirected to dashboard

### Test Role-Based Protection

1. Login as Student
2. Try accessing admin endpoints (should fail)
3. Login as Admin
4. Try accessing student endpoints (should fail)

## Protected API Routes

To protect routes that require authentication, use the `[Authorize]` attribute:

```csharp
[HttpGet("profile")]
[Authorize]
public async Task<IActionResult> GetProfile()
{
    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null)
        return Unauthorized();
    
    // Your logic here
}
```

## Error Handling

Common error messages:

| Error | Cause | Solution |
|-------|-------|----------|
| "Email already registered" | Email exists in database | Use different email |
| "Please verify your email with OTP first" | OTP not verified | Complete OTP verification step |
| "Invalid or expired OTP" | Wrong OTP or expired | Re-send OTP and try again |
| "Invalid email or password" | Credentials don't match selected role | Verify credentials and role |
| "Account is inactive" | Account disabled in database | Contact administrator |
| "Invalid user type" | Wrong user type passed | Select correct role |

## Security Considerations

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Storage**: JWT tokens stored in localStorage (consider using httpOnly cookies in production)
3. **CORS**: Configure CORS properly for production
4. **Rate Limiting**: Implement rate limiting on auth endpoints
5. **OTP Expiry**: OTP expires after 15 minutes
6. **Password Policy**: Enforce strong passwords in production
7. **Logout**: Clear localStorage on logout

## Troubleshooting

### SMTP Connection Issues

1. **Port 587 timeout**:
   - Check firewall settings
   - Verify SMTP:Host is correct
   - Ensure 2-Step Verification is enabled for Gmail

2. **Authentication Failed**:
   - Verify app password is 16 characters
   - Check SMTP:Username is correct
   - Ensure space-separated app password format: `xxxx xxxx xxxx xxxx`

### Database Connection Issues

1. **Connection refused**:
   - Verify connection_string is correct
   - Check PostgreSQL is running
   - Verify database exists

2. **SSL certificate errors**:
   - Add `sslmode=require` to connection string
   - For development, use `sslmode=disable`

### Frontend Issues

1. **CORS errors**:
   - Verify CORS policy in Program.cs
   - Check API_BASE_URL in .env

2. **Token not persisting**:
   - Check localStorage is enabled
   - Verify token is being set after login

## Next Steps

1. ✅ Core authentication implemented
2. Implement Dashboard components (Student and Admin)
3. Implement Protected routes middleware
4. Add password reset functionality
5. Add email verification for account creation
6. Add 2FA for admin accounts
7. Implement audit logging
8. Add refresh token mechanism
9. Implement role-based access control (RBAC)
10. Add email preferences management

## File Structure

```
Backend Changes:
- Models/Student.cs (NEW)
- Models/Admin.cs (NEW)
- Models/OtpVerification.cs (NEW)
- Services/IAuthenticationService.cs (NEW)
- Services/IEmailService.cs (NEW)
- Services/IOtpService.cs (NEW)
- Repositories/IStudentRepository.cs (NEW)
- Repositories/IAdminRepository.cs (NEW)
- Repositories/IOtpRepository.cs (NEW)
- Controllers/AuthController.cs (NEW)
- Data/StudySphereDbContext.cs (UPDATED)
- Program.cs (UPDATED)
- .env (UPDATED)
- .env.example (UPDATED)
- StudySphere.csproj (UPDATED)

Frontend Changes:
- Frontend/src/components/Signup.jsx (UPDATED)
- Frontend/src/components/Login.jsx (UPDATED)
- Frontend/src/components/Auth.css (UPDATED)

Database Changes:
- database/postgresql/01_create_tables.sql (UPDATED)
```

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API response messages
3. Check browser console for frontend errors
4. Review backend logs for server errors
