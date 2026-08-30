import { ApiError, type ApiErrorKind } from "@/api/client";
import { MessageCard } from "./MessageCard";

interface ErrorCopy {
  title: string;
  detail: string;
}

const MESSAGES: Record<ApiErrorKind, ErrorCopy> = {
  offline: {
    title: "You're offline",
    detail: "Check your connection, then try again.",
  },
  failed: {
    title: "Couldn't load clients",
    detail: "Something went wrong on our end. Try again in a moment.",
  },
  invalid: {
    title: "Client data looks wrong",
    detail: "The server sent something we can't read. Try again in a moment.",
  },
};

export interface DataErrorProps {
  error?: Error;
  onRetry: () => void;
}

export function DataError({ error, onRetry }: DataErrorProps) {
  const copy =
    error instanceof ApiError ? MESSAGES[error.kind] : MESSAGES.failed;

  return (
    <MessageCard
      title={copy.title}
      detail={copy.detail}
      action={{ label: "Try again", onPress: onRetry }}
    />
  );
}
