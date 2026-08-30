import { Component, type ErrorInfo, type ReactNode } from "react";
import { MessageCard } from "./MessageCard";

export interface ErrorBoundaryProps {
  label: string;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`${this.props.label} crashed`, error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <MessageCard
        title={`The ${this.props.label} stopped working`}
        detail="The rest of the page still works. Reload to bring it back."
        action={{ label: "Reload", onPress: () => window.location.reload() }}
      />
    );
  }
}
