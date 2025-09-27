# HT Connect Deployment Guide

## Quick Start with Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Git (to clone the repository)

### 1. Clone and Start the Application

```bash
# Clone the repository
git clone https://github.com/Hemakotibonthada/HT_HRMS.git
cd HT_HRMS

# Start all services
docker compose up --build
```

### 2. Seed the Database

```bash
# Wait for services to start, then seed the database
docker compose exec backend npx prisma db seed
```

### 3. Access the Application

- **Frontend UI**: http://localhost:8080
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/health

## Test Accounts

Use these credentials to explore different roles:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | `admin@htconnect.local` | `Admin@123` | Full access to all features, user management, payroll, offer letters |
| **Project Manager** | `pm@htconnect.local` | `Pm@12345` | Project management, team oversight, analytics dashboard |
| **Employee** | `engineer@htconnect.local` | `Employee@123` | Personal profile, timesheets, work items, benefits |

## Local Development Setup

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ht_connect?schema=public"
JWT_SECRET="super-secret-key"
JWT_EXPIRES_IN="1d"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

#### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:4000/api
```

## Production Deployment

### Docker Compose Production

1. Update `docker-compose.yml` with production values:
   - Change JWT_SECRET to a secure random string
   - Set strong database credentials
   - Configure proper CORS origins

2. Use a reverse proxy (nginx) for SSL termination:

```yaml
# docker-compose.prod.yml
version: '3.9'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
```

### Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests (if you create them).

## Database Migrations

### Apply Migrations
```bash
# In development
npx prisma migrate dev --name describe_your_changes

# In production
npx prisma migrate deploy
```

### Reset Database (Development Only)
```bash
npx prisma migrate reset
npm run prisma:seed
```

## Monitoring and Logs

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

### Database Access
```bash
# Connect to PostgreSQL
docker compose exec db psql -U postgres -d ht_connect
```

## Backup and Restore

### Database Backup
```bash
docker compose exec db pg_dump -U postgres ht_connect > backup.sql
```

### Database Restore
```bash
docker compose exec -T db psql -U postgres ht_connect < backup.sql
```

## Troubleshooting

### Common Issues

1. **Port Already in Use**
   ```bash
   # Check what's using the ports
   netstat -tulpn | grep :8080
   netstat -tulpn | grep :4000
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker compose ps
   docker compose logs db
   ```

3. **Frontend Build Issues**
   ```bash
   # Clear and rebuild
   docker compose down
   docker compose up --build --no-cache frontend
   ```

4. **API CORS Issues**
   - Ensure `FRONTEND_URL` matches your frontend domain
   - Check browser console for specific CORS errors

### Performance Optimization

1. **Database Indexing**: Review `schema.prisma` for proper indexes
2. **Frontend Bundle Size**: Run `npm run build` and analyze bundle
3. **API Response Caching**: Consider Redis for session storage
4. **CDN**: Use CDN for static assets in production

## Security Considerations

### Production Checklist

- [ ] Change default JWT_SECRET
- [ ] Use strong database passwords
- [ ] Enable HTTPS with proper certificates
- [ ] Configure proper CORS origins
- [ ] Set up database backups
- [ ] Monitor logs and set up alerting
- [ ] Regular security updates for dependencies
- [ ] Configure rate limiting on API endpoints

### Authentication

- JWT tokens expire in 24 hours (configurable)
- Passwords are hashed using bcrypt
- Role-based access control (RBAC) implemented
- Protected routes require valid JWT

## API Documentation

The backend provides RESTful APIs for:

- **Authentication**: `/api/auth/*`
- **User Management**: `/api/user/*`
- **Employee Portal**: `/api/employee/*`
- **Work Management**: `/api/work/*`
- **HR Functions**: `/api/hr/*`
- **Analytics**: `/api/analytics/*`
- **Attendance**: `/api/attendance/*`
- **Expenses**: `/api/expenses/*`
- **Recruitment**: `/api/recruitment/*`

## Feature Overview

### ✅ Implemented Features

#### Employee Portal
- [x] Employee profiles and contact management
- [x] Timesheet submission and approval workflow
- [x] Payslip upload and secure access
- [x] Organization structure viewer
- [x] Offer letter generator (Admin only)
- [x] Attendance tracking (multiple methods)
- [x] Benefits management and enrollment
- [x] Performance goal setting and reviews
- [x] Expense claim submission and approval

#### Work Portal
- [x] Project board with visual status indicators
- [x] Drag-and-drop Kanban board
- [x] Work item creation and management
- [x] Comments and activity history
- [x] Project timeline and milestones
- [x] Role-based access control
- [x] Sprint tracking and metrics

#### Analytics & Reporting
- [x] Real-time dashboard metrics
- [x] Attendance summaries
- [x] Expense reporting
- [x] Performance analytics
- [x] Recruitment pipeline tracking

### Technical Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **UI Components**: Custom components with drag-and-drop support
- **State Management**: TanStack Query for server state
- **Containerization**: Docker + Docker Compose

## Support

For issues and questions:
1. Check this deployment guide
2. Review the main README.md
3. Check existing GitHub issues
4. Create new issue with detailed error logs

---

**HT Connect** - Self-hosted HR and Work Management Platform
Built with ❤️ for R&D teams seeking complete data ownership.