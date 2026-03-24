import { create } from 'zustand';
import { assignees, generateTasks } from '../data/seed';
import type {
  Filters,
  PresenceUser,
  SortColumn,
  SortDirection,
  Status,
  Task,
} from '../types';

const defaultFilters: Filters = {
  statuses: [],
  priorities: [],
  assigneeIds: [],
  dueFrom: '',
  dueTo: '',
};

type ViewMode = 'kanban' | 'list' | 'timeline';

interface TrackerState {
  tasks: Task[];
  filters: Filters;
  view: ViewMode;
  sort: { column: SortColumn; direction: SortDirection };
  presenceUsers: PresenceUser[];
  setView: (view: ViewMode) => void;
  setFilters: (next: Partial<Filters>) => void;
  clearFilters: () => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  setSort: (column: SortColumn) => void;
  tickPresence: () => void;
  hydrateFromUrl: () => void;
}

const encodeCsv = (values: string[]) => values.join(',');

const parseCsv = (value: string | null): string[] => (value ? value.split(',').filter(Boolean) : []);

const syncUrl = (filters: Filters, view: ViewMode) => {
  const params = new URLSearchParams(window.location.search);

  const mapper: Record<string, string> = {
    statuses: encodeCsv(filters.statuses),
    priorities: encodeCsv(filters.priorities),
    assignees: encodeCsv(filters.assigneeIds),
    dueFrom: filters.dueFrom,
    dueTo: filters.dueTo,
    view,
  };

  Object.entries(mapper).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });

  const next = `${window.location.pathname}?${params.toString()}`;
  window.history.pushState({}, '', next);
};

const randomPresenceUsers = (taskIds: string[]): PresenceUser[] => {
  const pool = [
    { id: 'p1', name: 'Olivia', color: '#fb7185' },
    { id: 'p2', name: 'Mason', color: '#60a5fa' },
    { id: 'p3', name: 'Sophia', color: '#34d399' },
    { id: 'p4', name: 'Lucas', color: '#fbbf24' },
  ];

  return pool.slice(0, 3).map((user) => ({
    ...user,
    taskId: taskIds[Math.floor(Math.random() * taskIds.length)],
  }));
};

const seededTasks = generateTasks();

export const useTrackerStore = create<TrackerState>((set, get) => ({
  tasks: seededTasks,
  filters: defaultFilters,
  view: 'kanban',
  sort: { column: 'dueDate', direction: 'asc' },
  presenceUsers: randomPresenceUsers(seededTasks.map((task) => task.id)),

  setView: (view) => {
    set({ view });
    syncUrl(get().filters, view);
  },

  setFilters: (next) => {
    const filters = { ...get().filters, ...next };
    set({ filters });
    syncUrl(filters, get().view);
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
    syncUrl(defaultFilters, get().view);
  },

  updateTaskStatus: (taskId, status) => {
    set({
      tasks: get().tasks.map((task) => (task.id === taskId ? { ...task, status } : task)),
    });
  },

  setSort: (column) => {
    const current = get().sort;
    const direction: SortDirection =
      current.column === column && current.direction === 'asc' ? 'desc' : 'asc';
    set({ sort: { column, direction } });
  },

  tickPresence: () => {
    const ids = get().tasks.map((task) => task.id);
    set({
      presenceUsers: get().presenceUsers.map((user) => ({
        ...user,
        taskId: ids[Math.floor(Math.random() * ids.length)],
      })),
    });
  },

  hydrateFromUrl: () => {
    const params = new URLSearchParams(window.location.search);
    const nextFilters: Filters = {
      statuses: parseCsv(params.get('statuses')) as Filters['statuses'],
      priorities: parseCsv(params.get('priorities')) as Filters['priorities'],
      assigneeIds: parseCsv(params.get('assignees')),
      dueFrom: params.get('dueFrom') ?? '',
      dueTo: params.get('dueTo') ?? '',
    };

    const viewParam = params.get('view');
    const view: ViewMode =
      viewParam === 'list' || viewParam === 'timeline' || viewParam === 'kanban'
        ? viewParam
        : 'kanban';

    set({ filters: nextFilters, view });
  },
}));

export { assignees };
