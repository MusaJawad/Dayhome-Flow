# DayhomeFlow

DayhomeFlow is a full-stack childcare/dayhome management web app that helps providers manage children, track daily attendance, preview monthly invoices, and export invoices to Excel using a real invoice template.

This project was built as a SaaS-style application with authentication, user-owned data, a React dashboard, and a C# ASP.NET Core backend API.

## Features

- User registration and login
- JWT authentication
- Provider profile creation
- Add and view children
- Track daily attendance
- Record drop-off and pick-up times
- Mark children present or absent
- Generate monthly invoice previews
- Display Excel-style invoice grids in the frontend
- Export invoices to Excel using a formatted template
- Deduplicate parent names in invoice exports
- Fill provider name, month, year, and phone number in the invoice template
- User-owned data separation so each provider only sees their own records

## Tech Stack

### Backend

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQLite
- JWT Authentication
- BCrypt password hashing
- Swagger
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
│   ├── Data/
│   ├── Dtos/
│   ├── Models/
│   ├── Templates/
│   │   └── EducatorInvoiceTemplate.xlsx
│   ├── Program.cs
│   └── appsettings.json
│
└── dayhomeflow-client/
    ├── src/
    │   ├── api/
    │   ├── pages/
    │   ├── types/
    │   ├── App.tsx
    │   └── App.css
    └── package.json
