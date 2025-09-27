import { PrismaClient } from '../src/generated/prisma';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword('Admin@123');
  const pmPassword = await hashPassword('Pm@12345');
  const employeePassword = await hashPassword('Employee@123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@htconnect.local' },
    update: {},
    create: {
      email: 'admin@htconnect.local',
      passwordHash: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'Avery',
          lastName: 'Admin',
          position: 'Head of Operations',
          department: 'Operations',
          joiningDate: new Date('2020-01-01'),
          contactEmail: 'admin@htconnect.local',
          contactPhone: '+91-99999-00001',
          emergencyContact: 'Emergency Person - +91-99999-00002',
          reportingManager: 'CEO',
          managerId: null,
        },
      },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'pm@htconnect.local' },
    update: {},
    create: {
      email: 'pm@htconnect.local',
      passwordHash: pmPassword,
      role: 'PROJECT_MANAGER',
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Manager',
          position: 'Project Manager',
          department: 'R&D',
          joiningDate: new Date('2021-06-15'),
          contactEmail: 'pm@htconnect.local',
          contactPhone: '+91-99999-00003',
          emergencyContact: 'Emergency Person - +91-99999-00004',
          reportingManager: 'Head of Operations',
          managerId: admin.id,
        },
      },
    },
  });

  const engineer = await prisma.user.upsert({
    where: { email: 'engineer@htconnect.local' },
    update: {},
    create: {
      email: 'engineer@htconnect.local',
      passwordHash: employeePassword,
      role: 'EMPLOYEE',
      profile: {
        create: {
          firstName: 'Esha',
          lastName: 'Engineer',
          position: 'Senior R&D Engineer',
          department: 'R&D',
          joiningDate: new Date('2022-02-11'),
          contactEmail: 'engineer@htconnect.local',
          contactPhone: '+91-99999-00005',
          emergencyContact: 'Emergency Person - +91-99999-00006',
          reportingManager: 'Priya Manager',
          managerId: manager.id,
        },
      },
    },
  });

  const project = await prisma.project.upsert({
    where: { id: 'project-sample-1' },
    update: {},
    create: {
      id: 'project-sample-1',
      title: 'HT Connect Platform',
      description: 'Core R&D platform to unify HR and Work management.',
    status: 'IN_PROGRESS',
      startDate: new Date('2024-01-10'),
      dueDate: new Date('2024-12-31'),
      managerId: manager.id,
      members: {
        create: [
          { userId: manager.id, role: 'MANAGER' },
          { userId: engineer.id, role: 'CONTRIBUTOR' },
        ],
      },
      milestones: {
        create: [
          {
            title: 'MVP Launch',
            description: 'Deliver combined HR + Work portal MVP',
            startDate: new Date('2024-03-01'),
            dueDate: new Date('2024-06-30'),
          },
        ],
      },
    },
  });

  await prisma.workItem.upsert({
    where: { id: 'workitem-sample-1' },
    update: {},
    create: {
      id: 'workitem-sample-1',
      projectId: project.id,
      reporterId: manager.id,
      assigneeId: engineer.id,
      title: 'Design Work Portal Kanban',
      description: 'Create drag-and-drop kanban for Work Portal.',
    type: 'FEATURE',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
      dueDate: new Date('2024-04-15'),
      comments: {
        create: [
          {
            authorId: manager.id,
            body: 'Let us start with project board visual design references.'
          }
        ],
      },
      history: {
        create: [
          {
            changedById: manager.id,
            status: 'TODO',
          },
          {
            changedById: engineer.id,
            status: 'IN_PROGRESS',
          },
        ],
      },
    },
  });

  await prisma.timesheet.upsert({
    where: { id: 'timesheet-sample-1' },
    update: {},
    create: {
      id: 'timesheet-sample-1',
      userId: engineer.id,
      projectId: project.id,
      workItemId: 'workitem-sample-1',
      workDate: new Date('2024-03-20'),
    hours: '8',
      description: 'Designing kanban board wireframes',
      status: 'APPROVED',
      approvedById: manager.id,
      approvedAt: new Date('2024-03-21'),
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
