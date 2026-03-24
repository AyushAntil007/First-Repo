import { useMemo } from 'react';
import type { Task } from '../types';
import { asDate } from '../utils/date';
import styles from '../styles.module.css';

const priorityColor: Record<Task['priority'], string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#2563eb',
  low: '#16a34a',
};

interface Props {
  tasks: Task[];
}

export const TimelineView = ({ tasks }: Props) => {
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const days = endMonth.getDate();
  const dayWidth = 34;

  const todayOffset = (now.getDate() - 1) * dayWidth;

  const rows = useMemo(
    () =>
      tasks.map((task) => {
        const due = asDate(task.dueDate);
        const start = task.startDate ? asDate(task.startDate) : due;
        const clampedStart = new Date(Math.max(start.getTime(), startMonth.getTime()));
        const clampedEnd = new Date(Math.min(due.getTime(), endMonth.getTime()));
        const left = (clampedStart.getDate() - 1) * dayWidth;
        const width = Math.max(dayWidth, (clampedEnd.getDate() - clampedStart.getDate() + 1) * dayWidth);
        return { task, left, width };
      }),
    [tasks, dayWidth, endMonth, startMonth],
  );

  return (
    <section className={styles.timelineWrap}>
      <div className={styles.timelineScroller}>
        <div className={styles.timelineHeader} style={{ width: days * dayWidth }}>
          {Array.from({ length: days }).map((_, idx) => (
            <span key={idx}>{idx + 1}</span>
          ))}
        </div>
        <div className={styles.todayLine} style={{ left: todayOffset }} />
        {rows.map(({ task, left, width }) => (
          <div className={styles.timelineRow} key={task.id}>
            <span className={styles.timelineTitle}>{task.title}</span>
            <div className={styles.timelineTrack} style={{ width: days * dayWidth }}>
              <div
                className={styles.timelineBar}
                style={{ left, width, background: priorityColor[task.priority] }}
                title={`${task.startDate ?? task.dueDate} → ${task.dueDate}`}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
