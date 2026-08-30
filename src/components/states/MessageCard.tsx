import styles from "./MessageCard.module.css";

export interface MessageCardAction {
  label: string;
  onPress: () => void;
}

export interface MessageCardProps {
  title: string;
  detail: string;
  action?: MessageCardAction;
}

export function MessageCard({ title, detail, action }: MessageCardProps) {
  return (
    <div className={styles.card} role="alert">
      <p className={styles.title}>{title}</p>
      <p className={styles.detail}>{detail}</p>
      {action && (
        <button
          type="button"
          className={styles.action}
          onClick={action.onPress}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
