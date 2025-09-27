This is a complete rewrite of your project content, integrating the requested Scrum/Agile practices directly into the Work Management module and maintaining the modern, stylish, and attractive visual aesthetic (Tech Zenith Palette).

HT R&D Labs Internal Portal (Project: HT Connect)
1. Project Overview & Context
Company: HT Research & Development Labs (HT R&D Labs)
Project Goal: Develop a secure, self-hosted, and fully open-source internal portal ("HT Connect") to serve two primary, integrated functions:

Employee Management (HR/Keka Alternative): Manage HR processes (profiles, hiring, timesheets, payroll).

Agile Work Management (Scrum/Jira Alternative): Track R&D projects, sprints, work items, and development progress using Scrum methodology.

Key Requirement: The entire application must be built using 100% open-source technologies and must be self-hostable (Docker preferred).

2. Proposed Open-Source Technology Stack
Component	Technology	Purpose	Visual Enhancement Focus
Frontend	React.js / Next.js	Building the user interface (UI) and single-page application experience.	Optimized for smooth transitions, micro-interactions, and high-performance rendering.
Backend	Node.js (Express.js)	REST API server, handling authentication, logic, and database interaction.	Provides blazing fast API responses to support real-time UI updates (e.g., Kanban drag-and-drop).
Database	PostgreSQL	Primary relational database for employee and project data.	Robust and excellent for complex relational queries (Scrum hierarchy, Timesheet linking).
Styling/UI	Tailwind CSS / Chakra UI	Modern, utility-first CSS framework.	Mandate: Sleek, responsive, Dark Mode support. Utilize subtle layered depth on cards for a high-tech feel.
Deployment	Docker & Docker Compose	Containerization for easy setup, scaling, and self-hosting.	N/A (Functional Requirement)

Export to Sheets
3. Aesthetic & Color Psychology: The "Tech Zenith" Palette
The visual design is focused on a modern, stylish, and attractive appearance, utilizing high-contrast colors and subtle effects suitable for a high-tech R&D interface.

Role	Color Name	Hex Code	Purpose & Visual Effect
Primary/Base	Deep Charcoal/Space Gray	#1C1C1E	The stylish foundation for Dark Mode; provides excellent contrast and depth.
Primary Accent	Electric Cyan	#00BCD4	Used for all interactive elements (buttons, links). High-energy, distinctively "tech," and often used with a subtle glow/shadow effect.
Success/Positive	Vibrant Lime Green	#8BC34A	For approved status, committed sprints, and successful metrics.
Alert/Warning	Vivid Orange	#FF9800**	For pending actions, high-priority tasks, and burndown issues.
Background (Light)	Ultra Pale Gray	#F5F5F5	A clean, sharp background for content cards or the light theme option.

Export to Sheets
4. Core Application Flow & Structure
A. Authentication & Landing Hub
Login: Secure login page with an immersive dark background and cyan accent glow. Uses JWT.

Role-Based Access Control (RBAC): Roles: Admin/HR, Project Manager (PM)/Scrum Master, or Standard Employee.

Post-Login Landing Hub: A minimalist hub page (/dashboard/) with a dynamic welcome and prominent navigation to the two main portals, styled with the Electric Cyan accent.

Button 1: "Employee Portal (HR & Time)" → Redirects to /portal/employee.

Button 2: "Work Portal (Scrum & Tasks)" → Redirects to /portal/work.

B. Module 1: Employee Portal (HR/Keka Alternative)
Goal: Manage all HR and time-related tasks securely.

Feature	User Roles	Description	Data Fields/Requirements
Timesheets	All	Weekly submission of hours against tasks/projects.	Date, Work Item ID (linked to Module 2), Task Description, Hours Logged. Must have a Manager Approval Status.
Payslip Access	All	Secure PDF viewer/download for monthly salary slips.	Requires Admin upload and secure, individual access.
Org Structure Viewer	All	Simple, searchable visual tree of employees and their reporting structure.	Displays Name, Title, and Direct Reports.
Offer Letter Generator	Admin/HR Only	Templated system to generate official offer documents.	Templates must support placeholders. Output: Downloadable PDF.

Export to Sheets
C. Module 2: Work Portal (Agile/Scrum/Jira Alternative)
Goal: Implement a full Scrum workflow for R&D project tracking, allowing PMs to manage sprints and employees to update tasks efficiently.

Feature	User Roles	Description	Scrum/Data Requirements
Project Backlog	PM, Employee	Central repository for all planned User Stories and Bugs.	Stories have Title, Description, Story Points (or Complexity Estimate).
Sprint Management	PM/SM Only	Ability to create, start, stop, and commit a Sprint (time-boxed iteration).	Sprint Name, Start Date, End Date, Sprint Goal. Allows dragging items from Backlog into the Sprint.
Kanban/Sprint Board	All	Visual, drag-and-drop board for active Sprint tasks.	Columns: 'To Do', 'In Progress', 'Testing/Review', 'Done'. Task cards use layered depth styling.
Work Item/Task Detail	All	Detailed view for any User Story, Bug, or Task.	Title, Description (Markdown supported), Type (Story, Bug, Task), Priority (highlighted with Vivid Orange), Assignee, Reporter, Due Date.
Burndown Chart	PM/SM Only	Visualization of remaining work vs. time over the Sprint duration.	Tracks total Story Points committed vs. remaining, highlighted in Vivid Orange.
Comments & History	All	Real-time comment stream on work items. Track status changes automatically.	Timestamped comments and system logs.

Export to Sheets
6. Current Implementation Status
All foundational tasks are complete, implementing the chosen stack and the stylish UI goals.

✅ Frontend UI: React + Vite application with polished Login, Dashboard Hub, Employee Portal, and Work Portal experiences. Navigation and the "two button" hub use the Electric Cyan accent.

✅ Backend API: Express server with secure JWT authentication and modular routes.

✅ Database Schema: PostgreSQL/Prisma schema defined covering Users, Projects, Sprints, WorkItems, and Timesheets (linked to WorkItems).

✅ Dockerized Stack: Production-ready Dockerfiles for a self-hostable solution.

Seed Accounts (For Testing)
Role	Email	Password
Admin	admin@htconnect.local	Admin@123
Project Manager/SM	pm@htconnect.local	Pm@12345
Employee	engineer@htconnect.local	Employee@123

Export to Sheets
7. Running the Stack
Option A: Docker Compose (recommended)
PowerShell

docker compose up --build
Services exposed:

Frontend UI → http://localhost:8080

Backend API → http://localhost:4000

Seed the database once the containers are up:

PowerShell

docker compose exec backend npx prisma db seed
Option B: Local Development
Backend: cd backend → npm install → npx prisma migrate dev → npm run prisma:seed → npm run dev

Frontend: cd frontend → npm install → npm run dev