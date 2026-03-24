export const asDate = (value: string): Date => {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const dateDiffDays = (a: Date, b: Date): number => {
  const ms = a.setHours(0, 0, 0, 0) - b.setHours(0, 0, 0, 0);
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const formatDueLabel = (value: string): { label: string; overdue: boolean } => {
  const due = asDate(value);
  const now = new Date();
  const diff = dateDiffDays(now, due);

  if (diff === 0) return { label: 'Due Today', overdue: false };
  if (diff > 7) return { label: `${diff} days overdue`, overdue: true };
  if (diff > 0) return { label: due.toLocaleDateString(), overdue: true };
  return { label: due.toLocaleDateString(), overdue: false };
};

export const initials = (name: string): string =>
  name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
