# DayhomeFlow

DayhomeFlow is a production childcare management platform actively used by
Calgary dayhome providers to manage attendance, child records, provider
information, and monthly invoicing.

The application includes a JWT-secured ASP.NET Core REST API, a React and
TypeScript frontend, PostgreSQL persistence, user-isolated data access,
invoice generation, and Excel exports.

This project was built as a SaaS-style application with authentication, user-owned data, a React dashboard, and a C# ASP.NET Core backend API.

## Project Status

DayhomeFlow is currently a portfolio/demo MVP.

It is suitable for:

- Demonstrating full-stack development skills
- Testing with fake/demo data
- Showing authentication, CRUD, attendance tracking, and Excel export workflows
- Portfolio and job applications

It should not be used with real childcare records until production privacy, hosting, database, backup, and compliance controls are completed.

## Features

- Public landing page
- User registration and login
- JWT authentication
- BCrypt password hashing
- Rate limiting on login/register endpoints
- Provider profile/settings page
- Add, edit, deactivate, and reactivate children
- Store parent contact information
- Track daily attendance
- Edit and delete attendance records
- Record drop-off and pick-up times
- Mark children present or absent
- Generate monthly invoice previews
- Display Excel-style invoice grids in the frontend
- Export invoices to Excel using a formatted template
- Fill provider name, provider phone number, month, and year in the invoice
- Include parent names in the export
- Deduplicate parent names when multiple children share the same parent
- Sanitize Excel text values to reduce formula injection risk
- User-owned data separation so each provider only sees their own records

## Tech Stack

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQLite for local development
- JWT authentication
- BCrypt password hashing
- ASP.NET Core rate limiting
- Swagger/OpenAPI
- ClosedXML for Excel export

### Frontend

- React
- TypeScript
- Vite
- Axios
- React Router
- CSS

## Project Structure

```text
Dayhome Flow/
├── DayhomeFlowApi/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── AttendanceController.cs
│   │   ├── ChildrenController.cs
│   │   ├── InvoicesController.cs
│   │   └── ProviderProfileController.cs
│   ├── Data/
│   │   └── DayhomeFlowContext.cs
│   ├── Dtos/
│   ├── Models/
│   ├── Templates/
│   │   └── EducatorInvoiceTemplate.xlsx
│   ├── Program.cs
│   └── appsettings.json
│
├── dayhomeflow-client/
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx
│   │   │   ├── AttendancePage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── InvoicePage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   └── ProviderSettingsPage.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
│
├── README.md
└── .gitignore
```

## Backend Setup

Go into the backend folder:

```bash
cd DayhomeFlowApi
```

Restore dependencies:

```bash
dotnet restore
```

Apply database migrations:

```bash
dotnet ef database update
```

Run the API:

```bash
dotnet run
```

The API runs locally at something like:

```text
http://localhost:5192
```

Swagger is available at:

```text
http://localhost:5192/swagger
```

## Frontend Setup

Go into the frontend folder:

```bash
cd dayhomeflow-client
```

Install dependencies:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

The frontend runs locally at:

```text
http://localhost:5173
```

## Environment Variables and Secrets

### Backend

The JWT secret should not be committed to GitHub.

For local development, use .NET user secrets:

```bash
cd DayhomeFlowApi
dotnet user-secrets init
```

Generate and save a JWT key in PowerShell:

```powershell
$bytes = New-Object byte[] 64
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$jwtKey = [Convert]::ToBase64String($bytes)
dotnet user-secrets set "Jwt:Key" $jwtKey
```

Verify it was saved:

```bash
dotnet user-secrets list
```

Expected result:

```text
Jwt:Key = some_long_random_value
```

The `appsettings.json` file should not contain the real production JWT key.

Example local `Jwt` section:

```json
"Jwt": {
  "Key": "",
  "Issuer": "DayhomeFlowApi",
  "Audience": "DayhomeFlowUsers"
}
```

For deployment, the JWT key should be stored in the hosting platform’s environment variables.

### Frontend

Before deployment, the frontend API URL should be moved into an environment variable.

Local example:

```text
VITE_API_URL=http://localhost:5192/api
```

Production example:

```text
VITE_API_URL=https://your-backend-url.com/api
```

## Main API Endpoints

### Auth

```text
POST /api/Auth/register
POST /api/Auth/login
```

### Provider Profile

```text
GET /api/ProviderProfile/me
PUT /api/ProviderProfile/me
```

### Children

```text
GET    /api/Children
GET    /api/Children/active
GET    /api/Children/{id}
POST   /api/Children
PUT    /api/Children/{id}
DELETE /api/Children/{id}
```

The delete endpoint currently deactivates a child instead of permanently deleting the record.

### Attendance

```text
GET    /api/Attendance
GET    /api/Attendance/{id}
GET    /api/Attendance/child/{childId}
GET    /api/Attendance/monthly?year=2026&month=7
POST   /api/Attendance
PUT    /api/Attendance/{id}
DELETE /api/Attendance/{id}
```

### Invoices

```text
GET /api/Invoices/preview?year=2026&month=7
GET /api/Invoices/export/excel?year=2026&month=7
```

## Invoice Export

The Excel export uses a formatted invoice template located at:

```text
DayhomeFlowApi/Templates/EducatorInvoiceTemplate.xlsx
```

The backend fills the template with:

- Provider name
- Provider phone number
- Month
- Year
- Child names
- Parent names
- Daily attendance values
- Total monthly hours

The export intentionally does not calculate or fill:

- Contract fee
- Agency fees
- Liability insurance
- Storypark deductions
- Training courses
- Other deductions
- Additions
- Total paid

Those values are handled by the agency, not the dayhome provider.

## Attendance Values

The invoice preview and Excel export use these values:

```text
x = no attendance record
a = absent
0 = present without drop-off/pick-up times
number = calculated hours for that day
```

Example:

```text
8
8.5
9.25
a
x
```

## Authentication Flow

1. A provider registers an account.
2. The backend hashes the password using BCrypt.
3. On login, the backend returns a JWT token.
4. The frontend stores the token locally.
5. Protected API requests send the token using the Authorization header.
6. The backend uses the token to identify the provider.
7. All child, attendance, provider, and invoice data is filtered by the logged-in user’s ID.

## Security Features Implemented

- Passwords are hashed using BCrypt.
- Protected routes require JWT authentication.
- User-owned data filtering prevents providers from accessing other users’ data.
- Login and register endpoints are rate limited.
- JWT secret is stored using user-secrets locally instead of being committed to GitHub.
- Excel export sanitizes provider, parent, and child text values to reduce formula injection risk.
- SQLite database files are ignored by Git.
- No public admin or delete-all endpoint exists.

## Security Limitations

This is still a portfolio/demo MVP.

Before storing real childcare data, the following should be completed:

- Deploy over HTTPS only
- Use a production database such as PostgreSQL
- Store production secrets in hosting environment variables
- Lock CORS to the deployed frontend URL
- Add better logging and monitoring
- Add email verification or invite-only registration
- Add password reset
- Add account deletion/data deletion workflow
- Add a privacy policy
- Add database backups
- Consider using secure httpOnly cookies instead of localStorage JWT storage
- Add stricter validation for production data

## Privacy Note

DayhomeFlow is designed around sensitive childcare workflows. During development and portfolio demos, only fake/demo data should be used.

Example demo data:

```text
Child: Ayaan Test
Parent: Parent Example
Email: parent@example.com
Phone: 403-555-1234
```

Do not enter real child or parent information until production privacy and security controls are complete.

## Current Completed Features

- Public landing page
- Register/login
- JWT authentication
- Rate limiting for auth endpoints
- Provider settings page
- Children add/edit/deactivate/reactivate
- Attendance add/edit/delete
- Monthly invoice preview
- Excel invoice export
- Excel text sanitization
- Parent name deduplication
- Provider name and phone number on exported invoice
- User-owned data separation

## Planned Improvements

- Move frontend API URL to `.env`
- Add automatic logout on expired token or 401 response
- Switch local SQLite database to PostgreSQL for deployment
- Add production CORS configuration
- Add password reset
- Add email verification
- Add account deletion
- Add better dashboard stats
- Add loading states and empty states
- Add screenshots to README
- Add deployment instructions
- Deploy backend
- Deploy frontend
- Add public demo link

## Deployment Plan

Recommended deployment order:

1. Move frontend API URL to environment variables.
2. Add automatic logout on `401 Unauthorized`.
3. Prepare backend production settings.
4. Switch from SQLite to PostgreSQL.
5. Deploy backend.
6. Test online Swagger/API endpoints.
7. Deploy frontend.
8. Set `VITE_API_URL` to the deployed backend API URL.
9. Test full deployed flow with fake/demo data.

Recommended hosting:

```text
Frontend: Vercel
Backend: Render, Railway, Azure, or similar
Database: PostgreSQL
```

## Local Development Checklist

Backend:

```bash
cd DayhomeFlowApi
dotnet restore
dotnet ef database update
dotnet run
```

Frontend:

```bash
cd dayhomeflow-client
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Git Notes

The project should be committed from the parent folder:

```bash
cd "C:\Users\red\Desktop\Dayhome Flow"
git add .
git commit -m "Your commit message"
git push
```

Do not commit:

```text
node_modules
bin
obj
*.db
*.db-shm
*.db-wal
real secrets
real childcare data
```

The Excel template should be committed:

```text
DayhomeFlowApi/Templates/EducatorInvoiceTemplate.xlsx
```

## Author

Musa Jawad  
Software Engineering Graduate  
Full-Stack / Backend Developer
