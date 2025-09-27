# HT Connect API Documentation

## Overview

HT Connect provides a comprehensive REST API for managing HR and work operations. All endpoints require authentication unless otherwise specified.

## Authentication

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@htconnect.local",
  "password": "Admin@123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@htconnect.local",
    "role": "ADMIN",
    "profile": {
      "firstName": "Avery",
      "lastName": "Admin",
      "position": "Head of Operations",
      "department": "Operations"
    }
  }
}
```

### Authorization Header
Include JWT token in all subsequent requests:
```http
Authorization: Bearer <your-jwt-token>
```

## User Management

### Get User Profile
```http
GET /api/user/profile
Authorization: Bearer <token>
```

## Employee Portal APIs

### Timesheets

#### Get Timesheets
```http
GET /api/employee/timesheets
Authorization: Bearer <token>
```

#### Submit Timesheet
```http
POST /api/employee/timesheets
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": "project-uuid",
  "workItemId": "workitem-uuid",
  "workDate": "2024-03-20",
  "hours": 8,
  "description": "Working on feature implementation"
}
```

#### Update Timesheet Status (Managers only)
```http
PUT /api/employee/timesheets/{id}/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "APPROVED"
}
```

### Payslips

#### Get Payslips
```http
GET /api/employee/payslips
Authorization: Bearer <token>
```

#### Upload Payslip (Admin only)
```http
POST /api/employee/payslips
Content-Type: multipart/form-data
Authorization: Bearer <token>

userId: uuid
month: 3
year: 2024
file: [PDF file]
```

### Organization Structure
```http
GET /api/employee/org-structure
Authorization: Bearer <token>
```

### Offer Letter Generation (Admin only)
```http
POST /api/employee/offer-letter
Content-Type: application/json
Authorization: Bearer <token>

{
  "candidateName": "John Doe",
  "position": "Senior Developer",
  "department": "Engineering",
  "salary": 120000,
  "startDate": "2024-04-01",
  "reportingManager": "Jane Smith"
}
```

## Work Portal APIs

### Projects

#### Get Projects
```http
GET /api/work/projects
Authorization: Bearer <token>
```

#### Create Project
```http
POST /api/work/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "New R&D Initiative",
  "description": "Description of the project",
  "status": "IN_PROGRESS",
  "startDate": "2024-01-01",
  "dueDate": "2024-12-31"
}
```

### Work Items

#### Get Work Items
```http
GET /api/work/work-items
Authorization: Bearer <token>
```

#### Create Work Item
```http
POST /api/work/work-items
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": "project-uuid",
  "title": "Implement user authentication",
  "description": "Add JWT-based auth system",
  "type": "FEATURE",
  "priority": "HIGH",
  "assigneeId": "user-uuid",
  "reporterId": "user-uuid",
  "dueDate": "2024-04-15"
}
```

#### Update Work Item Status
```http
PUT /api/work/work-items/{id}/status
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "IN_PROGRESS"
}
```

#### Add Comment to Work Item
```http
POST /api/work/work-items/{id}/comments
Content-Type: application/json
Authorization: Bearer <token>

{
  "body": "Updated the implementation approach based on feedback"
}
```

## HR Management APIs

### Attendance

#### Record Attendance
```http
POST /api/attendance/logs
Content-Type: application/json
Authorization: Bearer <token>

{
  "type": "CHECK_IN",
  "method": "BIOMETRIC",
  "timestamp": "2024-03-20T09:00:00Z",
  "deviceId": "device-001",
  "locationName": "Main Office"
}
```

#### Get Attendance Logs
```http
GET /api/attendance/logs?from=2024-03-01&to=2024-03-31
Authorization: Bearer <token>
```

#### Get Attendance Summary
```http
GET /api/attendance/summary?from=2024-03-01&to=2024-03-31
Authorization: Bearer <token>
```

### Benefits

#### Get Benefit Plans
```http
GET /api/hr/benefits/plans
Authorization: Bearer <token>
```

#### Create Benefit Plan (Admin only)
```http
POST /api/hr/benefits/plans
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Health Insurance Premium",
  "description": "Comprehensive health coverage",
  "type": "HEALTH",
  "employeeContribution": 100.00,
  "employerContribution": 300.00,
  "effectiveFrom": "2024-01-01"
}
```

#### Enroll in Benefit Plan
```http
POST /api/hr/benefits/plans/{planId}/enroll
Content-Type: application/json
Authorization: Bearer <token>

{
  "effectiveDate": "2024-04-01"
}
```

### Payroll

#### Get Payroll Runs
```http
GET /api/hr/payroll/runs
Authorization: Bearer <token>
```

#### Create Payroll Run (Admin only)
```http
POST /api/hr/payroll/runs
Content-Type: application/json
Authorization: Bearer <token>

{
  "label": "March 2024 Payroll",
  "month": 3,
  "year": 2024
}
```

### Performance Management

#### Get Performance Cycles
```http
GET /api/hr/performance/cycles
Authorization: Bearer <token>
```

#### Create Performance Cycle (Admin only)
```http
POST /api/hr/performance/cycles
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Q1 2024 Performance Review",
  "status": "ACTIVE",
  "startDate": "2024-01-01",
  "endDate": "2024-03-31"
}
```

#### Get Performance Goals
```http
GET /api/hr/performance/goals
Authorization: Bearer <token>
```

#### Create Performance Goal
```http
POST /api/hr/performance/goals
Content-Type: application/json
Authorization: Bearer <token>

{
  "cycleId": "cycle-uuid",
  "title": "Improve code quality metrics",
  "description": "Achieve 90%+ test coverage",
  "dueDate": "2024-03-31"
}
```

## Expenses APIs

### Get Expense Claims
```http
GET /api/expenses/claims
Authorization: Bearer <token>
```

### Submit Expense Claim
```http
POST /api/expenses/claims
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Conference Travel",
  "description": "Travel expenses for tech conference",
  "category": "TRAVEL",
  "amount": 850.00,
  "currency": "USD",
  "incurredOn": "2024-03-15",
  "receiptUrl": "https://example.com/receipt.pdf"
}
```

### Update Expense Claim (Managers/Admin)
```http
PUT /api/expenses/claims/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "status": "APPROVED",
  "notes": "Approved for reimbursement"
}
```

### Get Expense Summary
```http
GET /api/expenses/summary
Authorization: Bearer <token>
```

## Recruitment APIs

### Get Job Openings
```http
GET /api/recruitment/jobs
Authorization: Bearer <token>
```

### Create Job Opening (Admin only)
```http
POST /api/recruitment/jobs
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Senior React Developer",
  "department": "Engineering",
  "location": "Remote",
  "description": "Join our R&D team...",
  "employmentType": "FULL_TIME",
  "openings": 2
}
```

### Get Candidate Pipeline
```http
GET /api/recruitment/pipeline
Authorization: Bearer <token>
```

### Create Candidate Application
```http
POST /api/recruitment/jobs/{jobId}/candidates
Content-Type: application/json
Authorization: Bearer <token>

{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "phone": "+1-555-0123",
  "resumeUrl": "https://example.com/resume.pdf",
  "source": "LinkedIn"
}
```

### Update Candidate Stage
```http
PUT /api/recruitment/candidates/{id}
Content-Type: application/json
Authorization: Bearer <token>

{
  "stage": "INTERVIEW",
  "stageNote": "Moving to technical interview round"
}
```

## Analytics APIs

### Get Overview Analytics (Admin/PM only)
```http
GET /api/analytics/overview
Authorization: Bearer <token>
```

**Response includes:**
- Headcount statistics
- Role distribution
- Active projects count
- Attendance summaries
- Recruitment pipeline metrics
- Expense totals
- Payroll summaries
- Performance status

## Error Handling

All APIs follow consistent error response format:

```json
{
  "message": "Error description",
  "details": {
    "field": ["Specific validation error"]
  }
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting is implemented, but consider implementing it for production:

- Authentication endpoints: 5 requests per minute
- Data modification endpoints: 60 requests per minute
- Read-only endpoints: 100 requests per minute

## Data Models

### User Roles
- `ADMIN` - Full system access
- `PROJECT_MANAGER` - Project and team management
- `EMPLOYEE` - Personal data and assigned work

### Work Item Statuses
- `TODO` - Not started
- `IN_PROGRESS` - Being worked on
- `REVIEW` - Under review/testing
- `DONE` - Completed

### Timesheet Statuses
- `PENDING` - Awaiting manager approval
- `APPROVED` - Approved by manager
- `REJECTED` - Rejected by manager

### Expense Statuses
- `SUBMITTED` - Submitted for approval
- `APPROVED` - Approved for reimbursement
- `REJECTED` - Rejected
- `REIMBURSED` - Payment processed

---

This API documentation covers the core endpoints. For the complete schema and additional endpoints, refer to the source code in the `backend/src/routes` directory.