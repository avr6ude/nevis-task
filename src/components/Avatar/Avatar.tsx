import { useState } from "react";
import { avatarColor, initials } from "@/domain/identity";
import styles from "./Avatar.module.css";

export interface AvatarProps {
  name: string;
  src?: string;
}

export function Avatar({ name, src }: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string>();

  return (
    <span
      className={styles.avatar}
      style={{ background: avatarColor(name) }}
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
