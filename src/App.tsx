import { useEffect, useMemo } from 'react';
import { FilterBar } from './components/FilterBar';
import { KanbanView } from './components/KanbanView';
import { ListView } from './components/ListView';
import { PresenceBar } from './components/PresenceBar';
import { TimelineView } from './components/TimelineView';
import { assignees, useTrackerStore } from './store/useTrackerStore';
import type { Task } from './types';
import { asDate } from './utils/date';
import styles from './styles.module.css';

const matchesFilters = (task: Task, filters: ReturnType<typeof useTrackerStore.getState>['filters']) => {
  if (filters.statuses.length && !filters.statuses.includes(task.status)) return false;
  if (filters.priorities.length && !filters.priorities.includes(task.priority)) return false;
  if (filters.assigneeIds.length && !filters.assigneeIds.includes(task.assigneeId)) return false;
  if (filters.dueFrom && asDate(task.dueDate) < asDate(filters.dueFrom)) return false;
  if (filters.dueTo && asDate(task.dueDate) > asDate(filters.dueTo)) return false;
  return true;
};

function App() {
  const { tasks, view, setView, filters, presenceUsers, hydrateFromUrl, tickPresence } = useTrackerStore();

  const filteredTasks = useMemo(() => tasks.filter((task) => matchesFilters(task, filters)), [tasks, filters]);

  useEffect(() => {
    hydrateFromUrl();
    const onPopState = () => hydrateFromUrl();
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [hydrateFromUrl]);

  useEffect(() => {
    const id = window.setInterval(() => {
      tickPresence();
    }, 2200);
    return () => window.clearInterval(id);
  }, [tickPresence]);

  return (
    <main className={styles.page}>
      <header className={styles.topHeader}>
        <div>
          <h1>Project Tracker</h1>
          <p>{filteredTasks.length} tasks visible • {assignees.length} assignees</p>
        </div>
        <div className={styles.viewSwitch}>
          {(['kanban', 'list', 'timeline'] as const).map((mode) => (
            <button
              key={mode}
              className={view === mode ? styles.activeViewBtn : ''}
              onClick={() => setView(mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </header>

      <PresenceBar users={presenceUsers} />
      <FilterBar filters={filters} />

      {view === 'kanban' ? <KanbanView tasks={filteredTasks} presenceUsers={presenceUsers} /> : null}
      {view === 'list' ? <ListView tasks={filteredTasks} /> : null}
      {view === 'timeline' ? <TimelineView tasks={filteredTasks} /> : null}
    </main>
  );
}

export default App;
