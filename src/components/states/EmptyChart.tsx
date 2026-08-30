import styles from "./EmptyChart.module.css";

export function EmptyChart({ message }: { message: string }) {
  return <p className={styles.empty}>{message}</p>;
}
