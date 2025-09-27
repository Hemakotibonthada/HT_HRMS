# HT R&D Labs Internal Portal (Project: HT Connect)

## 1. Project Overview & Context

**Company:** HT Research & Development Labs (HT R&D Labs)
**Project Goal:** Develop a secure, self-hosted, and fully open-source internal portal ("HT Connect") to serve two primary functions:
1.  **Employee Management (HR/Keka Alternative):** Manage HR processes (profiles, hiring, timesheets, payroll).
2.  **Work Management (Project/Jira Alternative):** Track R&D projects, work items, and development progress.

**Key Requirement:** The entire application must be built using **100% open-source technologies** and must be self-hostable (Docker preferred).

---

## 2. Proposed Open-Source Technology Stack

| Component | Technology | Purpose | Notes |
| :--- | :--- | :--- | :--- |
| **Frontend** | **React.js** (or Next.js for SSR) | Building the user interface (UI) and single-page application experience. | Highly performant and standard for modern web apps. |
| **Backend** | **Node.js (Express.js)** | REST API server, handling authentication, logic, and database interaction. | Fast, scalable, and uses JavaScript across the stack. |
| **Database** | **PostgreSQL** | Primary relational database for structured employee and project data. | Robust, open-source, and excellent for complex queries (like organization trees and payroll data). |
| **Styling/UI** | **Tailwind CSS** or **Chakra UI** | Modern, utility-first CSS framework for a sleek, responsive, and R&D-appropriate aesthetic. | Ensures a clean, high-tech look. |
| **Deployment** | **Docker & Docker Compose** | Containerization for easy setup, scaling, and self-hosting. | Essential for a startup environment. |

---

## 3. Core Application Flow & Structure

### A. Authentication & Role Detection
1.  **Login:** Secure login page (email/password). Authentication should use **JWT (JSON Web Tokens)** for security.
2.  **Role-Based Access Control (RBAC):** Backend must assign one of three roles: `Admin/HR`, `Project Manager`, or `Standard Employee`.
3.  **Post-Login Landing Page (The Hub):** Upon successful login, the employee is directed to a minimalist hub page (`/dashboard/`). This page shows the user's name and position and presents two large, distinct buttons:
    * **Button 1:** "Employee Portal (HR & Time)" $\rightarrow$ Redirects to `/portal/employee`.
    * **Button 2:** "Work Portal (Projects & Tasks)" $\rightarrow$ Redirects to `/portal/work`.

### B. Module 1: Employee Portal (HR/Keka Alternative)

**Goal:** Manage all HR and time-related tasks securely.

| Feature | User Roles | Description | Data Fields/Requirements |
| :--- | :--- | :--- | :--- |
| **Employee Profile** | All | View personal, job, and contact details. | Name, Position, Joining Date, Reporting Manager, Department, Contact, Emergency Contact. |
| **Timesheets** | All | Weekly submission of hours against tasks/projects. | Date, Project ID (linked to Module 2), Task Description, Hours Logged. Must have a **Manager Approval Status**. |
| **Payslip Access** | All | Secure PDF viewer/download for monthly salary slips. | Requires Admin upload of a PDF (or structured data) and secure, individual access based on User ID/Month. |
| **Offer Letter Generator** | Admin/HR Only | Templated system to generate official offer documents. | Templates must support placeholders for Name, Title, Salary, Date, and Reporting Manager. Output: **Downloadable PDF**. |
| **Org Structure Viewer** | All | Simple, searchable list/visual tree of employees and their reporting structure. | Displays Name, Title, and Direct Reports. |

### C. Module 2: Work Portal (Project/Jira Alternative)

**Goal:** Track the progress of R&D projects with agile-style work item management.

| Feature | User Roles | Description | Data Fields/Requirements |
| :--- | :--- | :--- | :--- |
| **Project Board** | PM, Employee | View all assigned projects. | Project Title, Status (In Progress, Complete, On Hold), Start Date, Due Date, Project Manager. |
| **Work Item/Task Tracking** | All | Creation and management of tasks within a project. | Title, Description (Markdown supported), **Type** (Feature, Bug, Task), **Priority** (High, Medium, Low), **Assignee**, **Reporter**, **Due Date**. |
| **Kanban Board View** | All | Visual, drag-and-drop board to track item status. | Columns must be customizable, e.g., 'To Do', 'In Progress', 'Review/Testing', 'Done'. |
| **Project Timeline/Gantt** | PM Only | Simple visualization of major milestones and task dependencies. | Requires linking tasks to a parent Project and defining basic start/end dates. |
| **Comments & History**| All | Allow users to comment on any work item. Track status changes automatically. | Timestamped comments and system logs for status changes. |

---

## 4. Co-Pilot Instructions

**Start by setting up the project structure and the open-source stack (MERN/Node.js/React).**

1.  **Project Initialization:** Create the basic React frontend structure and Express.js backend structure.
2.  **Docker Setup:** Create a `docker-compose.yml` file to spin up the Node.js API, React build, and a PostgreSQL database.
3.  **Database Schema:** Define the initial PostgreSQL schemas for `Users`, `Projects`, `WorkItems`, and `Timesheets`. Focus heavily on the relationships.
4.  **Core API Routes:** Implement the basic JWT authentication and the `/auth/login` and `/user/profile` endpoints.
5.  **Develop the Landing Hub:** Create the post-login page with the two portal buttons, implementing the role detection logic to ensure correct redirects.

**Focus on one module at a time, starting with the Work Portal as it’s core to R&D.**

*The ideal co-pilot workflow will start with setting up the project foundation, followed by data modeling, authentication, and then feature implementation in a modular way.*

---

## 5. Current Implementation Status

All foundational tasks listed above are now complete and live in the repository:

- ✅ **Frontend UI**: React + Vite application with polished Login, Dashboard Hub, Employee Portal, and Work Portal experiences. Role-aware navigation and the "two button" landing hub are implemented.
- ✅ **Backend API**: Express server with JWT authentication (`/auth/login`), user profile endpoints, and modular routes covering HR, work management, analytics, recruitment, attendance, payroll, and more.
- ✅ **Database Schema**: PostgreSQL schema defined via Prisma (`backend/prisma/schema.prisma`) covering users, projects, work items, timesheets, payroll, benefits, recruitment, and analytics relationships. Seeding scripts provision demo data and credentials.
- ✅ **Dockerized Stack**: Production-ready Dockerfiles for frontend and backend plus root `docker-compose.yml` to orchestrate PostgreSQL, API, and static UI delivery.

### Seed Accounts

Run the Prisma seed (see below) to load baseline users:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@htconnect.local` | `Admin@123` |
| Project Manager | `pm@htconnect.local` | `Pm@12345` |
| Employee | `engineer@htconnect.local` | `Employee@123` |

---

## 6. Running the Stack

### Option A: Docker Compose (recommended)

```powershell
docker compose up --build
```

Services exposed:

- Frontend UI → http://localhost:8080
- Backend API → http://localhost:4000 (health check at `/health`, API under `/api`)
- PostgreSQL → host-only at port 5432 (credentials: postgres/postgres)

The backend container automatically runs `prisma migrate deploy` on start. Seed the database once the containers are up:

```powershell
docker compose exec backend npx prisma db seed
```

### Option B: Local Development

1. Install dependencies:
    ```powershell
    cd backend
    npm install
    npx prisma migrate dev
    npm run prisma:seed
    npm run dev
    ```
2. In a separate terminal:
    ```powershell
    cd frontend
    npm install
    npm run dev
    ```

Set `VITE_API_BASE_URL` in `frontend/.env` if you customize backend ports.

---

## 7. UI Module Highlights

- **Login Experience**: Immersive hero panel with contextual highlights for HT Connect plus secure credential form.
- **Dashboard Hub**: Role badge, welcome copy, and prominent navigation to Employee vs Work portals.
- **Employee Portal**: Timesheets, payroll, payslips, attendance, benefits, expenses, analytics, org structure, recruitment, and performance management panels with real-time React Query data flows.
- **Work Portal**: Project board, Kanban with drag & drop, work item details, comment stream, sprint snapshot KPIs, creation forms, and milestone timeline to satisfy R&D-first workflows.

These views fulfil the README priority on UI completion before deeper infrastructure.


Landing Page


Aesthetic & Style:

A professional, modern, clean, and highly functional dashboard design for a corporate Human Resources Management System (HRMS) landing page. The design should follow the principles of flat/material design with subtle shadows, rounded corners, and clear information hierarchy. Use a color palette optimized for trustworthiness and visual comfort: Corporate Navy Blue (#1E3F66) for the navigation, Calming Aqua Green (#34A853) for success/positive metrics, Soft Red/Coral (#FF8A65) for alerts/pending items, and a Pure White (#FFFFFF) or very light grey (#F8F8F8) background.

Layout & Alignment (Horizontal View - Desktop):

Horizontal Desktop View. The layout must be strictly divided into three main sections:

Top Header Bar: A thin strip across the top (Navy Blue). Contains the company logo on the left, a search bar/notification bell icon, and a user avatar/profile access on the right.

Left Sidebar Navigation: A vertical section (Navy Blue, about 15% width). Contains main navigation links like 'Dashboard', 'My Profile', 'Time Off', 'Payslips', and 'Org Chart'. Ensure clean, centered text alignment.

Main Content Area (The Dashboard): The largest area (White/Light Grey background). This area must be divided into a title section and a grid of content cards, with content well-aligned to the left.

Key Components & Content:

Populate the Main Content Area with clear, labelled cards:

Main Title: "Welcome, [User Name]! Your HR Hub at a Glance."

Card 1 (Time Off): A circular data visualization (Aqua Green) showing "Vacation Balance: 15 Days."

Card 2 (Approvals): A rectangular card (with a soft red/coral accent) clearly labeled "Pending Approvals: 2 Leave Requests." It must include a prominent call-to-action button: "Review Now."

Card 3 (Payday): A simple informational card with a medium-blue accent, clearly stating "Upcoming Payday: [Date]."

Card 4 (Quick Actions): A section or card featuring 4-5 small, clean icons (e.g., 'Submit Timesheet', 'Request Leave', 'View Payslip') aligned neatly in a row or column.

Footer/Bottom Area: A section for "Recent Activities" with a single line entry (e.g., "Timesheet Submitted") with an Aqua Green checkmark icon.

Technical Specifications & Prompt Modifiers:

Full prompt to copy:

a professional, modern, clean HRMS dashboard landing page interface, desktop view, flat material design, horizontal orientation. Use Navy Blue (#1E3F66) for sidebar and header, Pure White (#FFFFFF) for the main content background. Use Calming Aqua Green (#34A853) for success metrics and Soft Red/Coral (#FF8A65) for alerts. Layout includes a left vertical navy navigation bar, a top navy header, and a main content grid. Show specific data cards: 'Time Off Balance (Green Circle Chart)', 'Pending Approvals (Red Accent Card)', and 'Upcoming Payday'. Ensure crisp text, 100% proper alignment, clear visual hierarchy, and extreme attention to UI/UX details. --ar 16:9

The --ar 16:9 at the end forces a wide, horizontal aspect ratio.


