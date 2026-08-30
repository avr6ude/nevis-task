import { useState } from "react";
import styles from "./Avatar.module.css";

export interface AvatarProps {
  name: string;
  src?: string;
}

const PALETTE = [
  "#c9b8f0",
  "#f0c3ad",
  "#a9cbb7",
  "#e7b1c4",
  "#b4c7e8",
  "#d8c69a",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function hashIndex(name: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % mod;
}

export function Avatar({ name, src }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const bg = PALETTE[hashIndex(name, PALETTE.length)];

  return (
    <span
      className={styles.avatar}
      style={{ background: bg }}
      aria-hidden="true"
    >
      <span className={styles.initials}>{initials(name)}</span>
      {src && failedSrc !== src && (
        <img
          className={styles.photo}
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
        />
      )}
    </span>
  );
}
