import type { Priority, Status, Task, User } from '../types';

const titles = [
  'Implement auth flow',
  'Write regression tests',
  'Create onboarding modal',
  'Fix dropdown alignment',
  'Audit accessibility labels',
  'Optimize API payload',
  'Set up monitoring alerts',
  'Build analytics dashboard',
  'Migrate settings page',
  'Refactor timeline renderer',
];

export const assignees: User[] = [
  { id: 'u1', name: 'Ava Reed', color: '#ef4444' },
  { id: 'u2', name: 'Noah Smith', color: '#3b82f6' },
  { id: 'u3', name: 'Liam Patel', color: '#22c55e' },
  { id: 'u4', name: 'Emma Wilson', color: '#a855f7' },
  { id: 'u5', name: 'Mia Johnson', color: '#f59e0b' },
  { id: 'u6', name: 'Ethan Lee', color: '#14b8a6' },
];

const statuses: Status[] = ['todo', 'in_progress', 'in_review', 'done'];
const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];

const randomFrom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const iso = (d: Date) => d.toISOString().slice(0, 10);

export const generateTasks = (count = 520): Task[] => {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const dueOffset = Math.floor(Math.random() * 40) - 15;
    const dueDate = new Date(now);
    dueDate.setDate(now.getDate() + dueOffset);

    const hasStartDate = Math.random() > 0.18;
    let startDate: string | null = null;
    if (hasStartDate) {
      const startOffset = dueOffset - (Math.floor(Math.random() * 10) + 1);
      const sd = new Date(now);
      sd.setDate(now.getDate() + startOffset);
      startDate = iso(sd);
    }

    return {
      id: `task-${i + 1}`,
      title: `${randomFrom(titles)} #${i + 1}`,
      assigneeId: randomFrom(assignees).id,
      status: randomFrom(statuses),
      priority: randomFrom(priorities),
      startDate,
      dueDate: iso(dueDate),
    };
  });
};
