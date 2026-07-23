DayhomeFlow

A production childcare management platform actively used by Calgary dayhome providers.

DayhomeFlow helps providers manage child records, track daily attendance, maintain provider information, preview monthly invoices, and export completed attendance data into a formatted Excel invoice template.

The application combines a JWT-secured ASP.NET Core REST API with a React and TypeScript frontend, PostgreSQL persistence in production, and user-isolated data access so each provider can only access their own records.

Open the live application

Why I Built It

Dayhome providers often track attendance and prepare monthly invoices through repetitive spreadsheets and manual record keeping. DayhomeFlow centralizes that workflow in one application and reduces the amount of repeated data entry required each month.

The platform was designed around real provider workflows and is now used by Calgary dayhomes for day-to-day attendance and invoicing tasks.

Core Features

Provider registration and login

JWT-based authentication and protected routes

Provider profile and contact-information management

Add, edit, deactivate, and reactivate child records

Store parent and guardian contact information

Record daily attendance, absences, drop-off times, and pick-up times

Edit and remove attendance records

Preview monthly attendance in an Excel-style grid

Calculate daily and monthly attendance hours

Export monthly invoices using a formatted Excel template

Insert provider, child, parent, month, year, and attendance information into exports

Isolate records by authenticated provider account

Architecture

flowchart LR
    U[Dayhome Provider] --> F[React + TypeScript Frontend]
    F -->|HTTPS / JSON| A[ASP.NET Core REST API]
    A -->|Entity Framework Core| P[(PostgreSQL)]
    A --> J[JWT Authentication]
    A --> E[ClosedXML Excel Export]
    F -. deployed on .-> V[Vercel]
    A -. containerized and deployed on .-> R[Render]

Technology Stack

Backend

C# and ASP.NET Core Web API

Entity Framework Core

PostgreSQL in production

SQLite for local development

JWT authentication

BCrypt password hashing

ASP.NET Core rate limiting

Swagger / OpenAPI

ClosedXML for Excel generation

Frontend

React

TypeScript

Vite

Axios

React Router

CSS

Deployment

Docker

Render

Vercel

Environment-based configuration

Engineering Highlights

User-isolated data access

Authenticated requests are associated with the provider account identified by the JWT. Child, attendance, provider, and invoice queries are filtered by that account so one provider cannot retrieve another provider's records.

Flexible database configuration

The API supports SQLite for local development and PostgreSQL for production. The database provider and connection string are supplied through configuration rather than being hard-coded.

Template-based Excel exports

Monthly invoices are generated from a formatted Excel template instead of a blank workbook. The API fills provider information, parent names, child names, attendance values, and monthly totals while preserving the layout expected by providers.

Text values are sanitized before export to reduce the risk of spreadsheet formula injection.

Production deployment

The backend is built and published through a multi-stage Docker image. The frontend and API use environment-specific URLs and CORS configuration for local and deployed environments.

Security Controls Implemented

BCrypt password hashing

JWT authentication for protected endpoints

Provider-owned record filtering

Rate limiting on registration and login endpoints

Environment-based secret management

Restricted CORS configuration

Excel text sanitization

No public administrative or bulk-delete endpoint

DayhomeFlow does not claim certification under a specific privacy or security framework. Additional security review, monitoring, backups, and operational controls remain ongoing priorities as the platform develops.

Project Structure

Dayhome-Flow/
├── DayhomeFlowApi/
│   ├── Controllers/
│   ├── Data/
│   ├── Dtos/
│   ├── Migrations/
│   ├── Models/
│   ├── Templates/
│   │   └── EducatorInvoiceTemplate.xlsx
│   ├── Program.cs
│   └── DayhomeFlowApi.csproj
├── dayhomeflow-client/
│   ├── src/
│   │   ├── api/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── App.css
│   └── package.json
├── Dockerfile
└── README.md

Local Development

Prerequisites

.NET SDK

Node.js and npm

SQLite, or access to PostgreSQL

Entity Framework Core CLI tools

1. Clone the repository

git clone https://github.com/MusaJawad/Dayhome-Flow.git
cd Dayhome-Flow

2. Configure the backend

cd DayhomeFlowApi
dotnet restore
dotnet user-secrets init

Set a development JWT key:

dotnet user-secrets set "Jwt:Key" "replace-with-a-long-random-development-key"

Example development configuration:

{
  "DatabaseProvider": "Sqlite",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=dayhomeflow.db"
  },
  "Jwt": {
    "Issuer": "DayhomeFlowApi",
    "Audience": "DayhomeFlowUsers"
  },
  "AllowedOrigins": [
    "http://localhost:5173"
  ]
}

Apply migrations and run the API:

dotnet ef database update
dotnet run

Swagger is available from the local API's /swagger route while development documentation is enabled.

3. Configure the frontend

Open another terminal:

cd dayhomeflow-client
npm install

Create a local .env file:

VITE_API_URL=http://localhost:5192/api

Use the port printed by the API if it differs from 5192, then start the frontend:

npm run dev

Main API Areas

/api/Auth
/api/ProviderProfile
/api/Children
/api/Attendance
/api/Invoices

The API supports authentication, provider profile management, child-record CRUD operations, attendance tracking, monthly invoice previews, and Excel exports.

Current Roadmap

Password-reset workflow

Email verification or invite-based registration

Account and data-deletion workflow

Expanded automated API and frontend tests

Improved operational logging and monitoring

Automated database-backup verification

Audit-history features for sensitive record changes

Additional dashboard reporting

Author

Musa JawadBackend Software EngineerLinkedIn · Portfolio · GitHub
