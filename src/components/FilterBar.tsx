import { assignees, useTrackerStore } from '../store/useTrackerStore';
import type { Filters, Priority, Status } from '../types';
import styles from '../styles.module.css';

const statuses: Array<{ label: string; value: Status }> = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Done', value: 'done' },
];

const priorities: Array<{ label: string; value: Priority }> = [
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

interface Props {
  filters: Filters;
}

const updateMulti = <T extends string,>(selected: T[], value: T): T[] =>
  selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value];

export const FilterBar = ({ filters }: Props) => {
  const setFilters = useTrackerStore((state) => state.setFilters);
  const clearFilters = useTrackerStore((state) => state.clearFilters);

  const isActive =
    filters.statuses.length > 0 ||
    filters.priorities.length > 0 ||
    filters.assigneeIds.length > 0 ||
    filters.dueFrom ||
    filters.dueTo;

  return (
    <section className={styles.filterBar}>
      <div>
        <p>Status</p>
        <div className={styles.chipsRow}>
          {statuses.map((status) => (
            <button
              key={status.value}
              className={`${styles.chip} ${filters.statuses.includes(status.value) ? styles.activeChip : ''}`}
              onClick={() => setFilters({ statuses: updateMulti(filters.statuses, status.value) })}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p>Priority</p>
        <div className={styles.chipsRow}>
          {priorities.map((priority) => (
            <button
              key={priority.value}
              className={`${styles.chip} ${filters.priorities.includes(priority.value) ? styles.activeChip : ''}`}
              onClick={() =>
                setFilters({ priorities: updateMulti(filters.priorities, priority.value) })
              }
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>

      <label className={styles.selectWrap}>
        Assignee
        <select
          value=""
          onChange={(event) => {
            const selected = event.target.value;
            if (!selected) return;
            setFilters({ assigneeIds: updateMulti(filters.assigneeIds, selected) });
            event.target.value = '';
          }}
        >
          <option value="">Select assignee</option>
          {assignees.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <div className={styles.chipsRow}>
          {filters.assigneeIds.map((id) => {
            const user = assignees.find((item) => item.id === id);
            if (!user) return null;
            return (
              <button
                key={id}
                className={`${styles.chip} ${styles.activeChip}`}
                onClick={() =>
                  setFilters({ assigneeIds: filters.assigneeIds.filter((assigneeId) => assigneeId !== id) })
                }
              >
                {user.name}
              </button>
            );
          })}
        </div>
      </label>

      <label className={styles.selectWrap}>
        Due from
        <input
          type="date"
          value={filters.dueFrom}
          onChange={(event) => setFilters({ dueFrom: event.target.value })}
        />
      </label>
      <label className={styles.selectWrap}>
        Due to
        <input
          type="date"
          value={filters.dueTo}
          onChange={(event) => setFilters({ dueTo: event.target.value })}
        />
      </label>

      {isActive ? (
        <button className={styles.clearButton} onClick={clearFilters}>
          Clear all filters
        </button>
      ) : null}
    </section>
  );
};
