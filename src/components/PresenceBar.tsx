import type { PresenceUser } from '../types';
import { initials } from '../utils/date';
import styles from '../styles.module.css';

interface Props {
  users: PresenceUser[];
}

export const PresenceBar = ({ users }: Props) => (
  <div className={styles.presenceBar}>
    <div className={styles.avatarStack}>
      {users.map((user) => (
        <span key={user.id} className={styles.avatar} style={{ background: user.color }} title={user.name}>
          {initials(user.name)}
        </span>
      ))}
    </div>
    <p>{users.length} people are viewing this board</p>
  </div>
);
