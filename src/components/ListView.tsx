import { useMemo, useState } from 'react';
import { assignees, useTrackerStore } from '../store/useTrackerStore';
import type { SortColumn, Task } from '../types';
import { formatDueLabel } from '../utils/date';
import styles from '../styles.module.css';

const rowHeight = 58;
const buffer = 5;

const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 };

interface Props {
  tasks: Task[];
}

export const ListView = ({ tasks }: Props) => {
  const sort = useTrackerStore((state) => state.sort);
  const setSort = useTrackerStore((state) => state.setSort);
  const updateStatus = useTrackerStore((state) => state.updateTaskStatus);
  const [scrollTop, setScrollTop] = useState(0);

  const sorted = useMemo(() => {
    return [...tasks].sort((a, b) => {
      let result = 0;
      if (sort.column === 'title') result = a.title.localeCompare(b.title);
      if (sort.column === 'priority') result = priorityRank[a.priority] - priorityRank[b.priority];
      if (sort.column === 'dueDate') result = a.dueDate.localeCompare(b.dueDate);
      return sort.direction === 'asc' ? result : -result;
    });
  }, [sort, tasks]);

  const viewportHeight = 520;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - buffer);
  const visible = Math.ceil(viewportHeight / rowHeight) + buffer * 2;
  const end = Math.min(sorted.length, start + visible);

  const items = sorted.slice(start, end);
  const topSpacer = start * rowHeight;
  const bottomSpacer = (sorted.length - end) * rowHeight;

  const SortHeader = ({ column, label }: { column: SortColumn; label: string }) => (
    <button className={styles.thButton} onClick={() => setSort(column)}>
      {label}
      {sort.column === column ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}
    </button>
  );

  if (tasks.length === 0) {
    return <div className={styles.emptyState}>No tasks match current filters. Clear filters to continue.</div>;
  }

  return (
    <section className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <SortHeader column="title" label="Title" />
        <SortHeader column="priority" label="Priority" />
        <SortHeader column="dueDate" label="Due Date" />
        <span>Status</span>
      </div>
      <div className={styles.virtualViewport} onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
        <div style={{ height: topSpacer }} />
        {items.map((task) => {
          const due = formatDueLabel(task.dueDate);
          const assignee = assignees.find((u) => u.id === task.assigneeId)?.name;
          return (
            <div key={task.id} className={styles.tableRow} style={{ height: rowHeight }}>
              <div>
                <strong>{task.title}</strong>
                <small>{assignee}</small>
              </div>
              <span>{task.priority}</span>
              <span className={due.overdue ? styles.overdue : ''}>{due.label}</span>
              <select
                value={task.status}
                onChange={(event) => updateStatus(task.id, event.target.value as Task['status'])}
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
          );
        })}
        <div style={{ height: bottomSpacer }} />
      </div>
      <p className={styles.rowCount}>Showing {tasks.length} tasks</p>
    </section>
  );
};
