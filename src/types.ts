export type Status = 'todo' | 'in_progress' | 'in_review' | 'done';
export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  status: Status;
  priority: Priority;
  startDate: string | null;
  dueDate: string;
}

export interface Filters {
  statuses: Status[];
  priorities: Priority[];
  assigneeIds: string[];
  dueFrom: string;
  dueTo: string;
}

export type SortColumn = 'title' | 'priority' | 'dueDate';
export type SortDirection = 'asc' | 'desc';

export interface PresenceUser {
  id: string;
  name: string;
  color: string;
  taskId: string;
}
