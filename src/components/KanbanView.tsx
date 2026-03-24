import { useMemo, useRef, useState } from 'react';
import { assignees, useTrackerStore } from '../store/useTrackerStore';
import type { PresenceUser, Status, Task } from '../types';
import { formatDueLabel, initials } from '../utils/date';
import styles from '../styles.module.css';

const columns: Array<{ key: Status; label: string }> = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'in_review', label: 'In Review' },
  { key: 'done', label: 'Done' },
];

const priorityClass: Record<Task['priority'], string> = {
  critical: styles.pCritical,
  high: styles.pHigh,
  medium: styles.pMedium,
  low: styles.pLow,
};

interface Props {
  tasks: Task[];
  presenceUsers: PresenceUser[];
}

export const KanbanView = ({ tasks, presenceUsers }: Props) => {
  const updateStatus = useTrackerStore((state) => state.updateTaskStatus);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverColumn, setHoverColumn] = useState<Status | null>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number; title: string } | null>(null);
  const pointerOffset = useRef({ x: 0, y: 0 });

  const grouped = useMemo(
    () =>
      columns.reduce(
        (acc, column) => {
          acc[column.key] = tasks.filter((task) => task.status === column.key);
          return acc;
        },
        {} as Record<Status, Task[]>,
      ),
    [tasks],
  );

  const findDropColumn = (x: number, y: number): Status | null => {
    const element = document.elementFromPoint(x, y);
    const zone = element?.closest('[data-column]') as HTMLElement | null;
    return (zone?.dataset.column as Status | undefined) ?? null;
  };

  return (
    <div className={styles.kanbanBoard}>
      {columns.map((column) => (
        <section
          key={column.key}
          data-column={column.key}
          className={`${styles.kanbanColumn} ${hoverColumn === column.key ? styles.columnHover : ''}`}
        >
          <header className={styles.columnHeader}>
            <h3>{column.label}</h3>
            <span>{grouped[column.key].length}</span>
          </header>
          <div className={styles.columnScroll}>
            {grouped[column.key].length === 0 ? (
              <p className={styles.emptyColumn}>No tasks in this stage</p>
            ) : null}
            {grouped[column.key].map((task) => {
              const assignee = assignees.find((item) => item.id === task.assigneeId)!;
              const due = formatDueLabel(task.dueDate);
              const watchers = presenceUsers.filter((user) => user.taskId === task.id);

              return (
                <article
                  key={task.id}
                  className={`${styles.taskCard} ${draggingId === task.id ? styles.placeholder : ''}`}
                  onPointerDown={(event) => {
                    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
                    pointerOffset.current = { x: event.clientX - rect.left, y: event.clientY - rect.top };
                    setDraggingId(task.id);
                    setGhost({ x: rect.left, y: rect.top, title: task.title });
                    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
                  }}
                  onPointerMove={(event) => {
                    if (draggingId !== task.id) return;
                    const x = event.clientX - pointerOffset.current.x;
                    const y = event.clientY - pointerOffset.current.y;
                    setGhost({ x, y, title: task.title });
                    setHoverColumn(findDropColumn(event.clientX, event.clientY));
                  }}
                  onPointerUp={(event) => {
                    if (draggingId !== task.id) return;
                    const target = findDropColumn(event.clientX, event.clientY);
                    if (target) updateStatus(task.id, target);
                    setDraggingId(null);
                    setHoverColumn(null);
                    setGhost(null);
                  }}
                >
                  <h4>{task.title}</h4>
                  <div className={styles.cardMeta}>
                    <span className={`${styles.priority} ${priorityClass[task.priority]}`}>{task.priority}</span>
                    <span className={due.overdue ? styles.overdue : ''}>{due.label}</span>
                  </div>
                  <div className={styles.assigneeLine}>
                    <span className={styles.avatar} style={{ background: assignee.color }}>
                      {initials(assignee.name)}
                    </span>
                    <small>{assignee.name}</small>
                    {watchers.length > 0 ? (
                      <div className={styles.cardWatchers}>
                        {watchers.slice(0, 2).map((user) => (
                          <span
                            className={styles.tinyAvatar}
                            style={{ background: user.color }}
                            key={user.id}
                            title={`${user.name} viewing`}
                          >
                            {initials(user.name)}
                          </span>
                        ))}
                        {watchers.length > 2 ? <span className={styles.moreCount}>+{watchers.length - 2}</span> : null}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {ghost ? (
        <div className={styles.dragGhost} style={{ left: ghost.x, top: ghost.y }}>
          {ghost.title}
        </div>
      ) : null}
    </div>
  );
};
