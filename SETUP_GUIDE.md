# Quick Setup Guide - StudySphere Authentication

## Prerequisites
- ✅ .NET 8.0 SDK installed
- ✅ Node.js and npm installed
- ✅ PostgreSQL database (Neon)
- ✅ Gmail account (or other SMTP provider)

## Step 1: Configure Environment Variables

Edit `.env` file and update these values:

```env
# Keep existing DB connection string
connection_string=postgresql://...

# Add SMTP Configuration (Gmail Example)
SMTP:Host=smtp.gmail.com
SMTP:Port=587
SMTP:Username=your_email@gmail.com
SMTP:Password=your_app_password_16_chars
SMTP:SenderEmail=your_email@gmail.com

# JWT Configuration
JWT:Secret=generate-a-random-32-char-string-here
JWT:Issuer=StudySphere
JWT:Audience=StudySphereUsers
```

### Getting Gmail App Password:
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Copy the 16-character password generated
4. Use this in `SMTP:Password` (with spaces: `xxxx xxxx xxxx xxxx`)

### Generate JWT Secret:
Use any random 32+ character string. Options:
- Use an online generator: https://www.random.org/cgi-bin/randbytes?nbytes=32&format=h
- Use a password manager to generate one

## Step 2: Update Database

Run the SQL migration file to create the new tables:

```bash
# Using your PostgreSQL client or Neon console
# Execute the following file:
database/postgresql/01_create_tables.sql
```

This creates:
- `student` table
- `admin` table
- `otp_verification` table

## Step 3: Restore NuGet Packages

```bash
cd d:\Ammad\Bahria\ University\ Karachi\4th\ Semester\DBMS\ LAB\StudySphere
dotnet restore
```

## Step 4: Run Backend

```bash
dotnet run
```

Backend will start at: `http://localhost:5000`

You should see:
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
```

## Step 5: Run Frontend

Open a new terminal:

```bash
cd Frontend
npm install
npm run dev
```

Frontend will start at: `http://localhost:5173` (or another port if 5173 is taken)

## Step 6: Test the System

### Test Signup:
1. Go to http://localhost:5173
2. Click "Create Student Account"
3. Enter test data:
   - Name: Test Student
   - Enrollment: BU-21-TEST
   - Email: your_email@gmail.com (must be real to receive OTP)
4. Click "Send Verification Code"
5. Check your email inbox for OTP
6. Enter the 6-digit code
7. Create a password (min 6 chars)
8. You should be logged in and redirected to dashboard

### Test Login:
1. Click "Back to Login"
2. Make sure "Student" role is selected
3. Enter the email and password from signup
4. Should login successfully

### Test Admin Signup:
1. On signup page, click "Administrator"
2. Fill in test data (no enrollment number needed for admin)
3. Follow same OTP verification process
4. Create admin account

### Test Admin Login:
1. On login page, click "Administrator"
2. Enter admin credentials
3. Should login as admin

## Troubleshooting

### SMTP Not Sending OTP
- ❌ Check Gmail 2-Step Verification is enabled
- ❌ Verify App Password is correct (should be 16 chars)
- ❌ Check firewall allows port 587
- ❌ Review backend logs for SMTP errors

### CORS Errors in Frontend
- ❌ Check backend is running on http://localhost:5000
- ❌ Verify API calls use correct base URL

### Database Connection Errors
- ❌ Verify connection_string in .env is correct
- ❌ Check PostgreSQL database exists
- ❌ Confirm tables were created from SQL script

### OTP Not Arriving
- ❌ Check spam/junk folder
- ❌ Verify email address is spelled correctly
- ❌ Wait a few seconds for SMTP delivery
- ❌ Check email in backend logs

## Files Modified/Created

### Backend
```
NEW:
- Models/Student.cs
- Models/Admin.cs
- Models/OtpVerification.cs
- Services/IAuthenticationService.cs
- Services/IEmailService.cs
- Services/IOtpService.cs
- Repositories/IStudentRepository.cs
- Repositories/IAdminRepository.cs
- Repositories/IOtpRepository.cs
- Controllers/AuthController.cs
- AUTHENTICATION_GUIDE.md

MODIFIED:
- Program.cs (added services and JWT auth)
- Data/StudySphereDbContext.cs (added DbSets)
- StudySphere.csproj (added packages)
- .env (added SMTP and JWT config)
- .env.example (documentation)
```

### Frontend
```
MODIFIED:
- Frontend/src/components/Signup.jsx (3-step OTP flow)
- Frontend/src/components/Login.jsx (enhanced role-based login)
- Frontend/src/components/Auth.css (step indicator styles)
```

### Database
```
MODIFIED:
- database/postgresql/01_create_tables.sql (added OTP table and constraints)
```

## API Endpoints Ready to Use

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/send-otp | Send OTP to email |
| POST | /api/auth/verify-otp | Verify OTP code |
| POST | /api/auth/signup | Create new account |
| POST | /api/auth/login | Login user |

## Next Steps After Setup

1. ✅ Test signup with OTP
2. ✅ Test login with different roles
3. ✅ Implement Dashboard components
4. ✅ Add protected routes/role-based access
5. ✅ Implement password reset
6. ✅ Add email confirmation
7. ✅ Deploy to production

## Need Help?

Refer to `AUTHENTICATION_GUIDE.md` for:
- Detailed API documentation
- Complete configuration options
- Database schema details
- Security considerations
- Advanced troubleshooting

---

**Status**: ✅ Complete and Ready to Test
**Last Updated**: April 20, 2026
