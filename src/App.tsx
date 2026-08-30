import { Dashboard } from "@components/Dashboard/Dashboard";
import { ErrorBoundary } from "@components/states/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary label="page">
      <Dashboard />
    </ErrorBoundary>
  );
}
