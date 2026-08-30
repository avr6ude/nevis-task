import { useMemo } from "react";
import { useClients } from "@/api/useClients";
import {
  ChartSkeleton,
  ClientsChart,
  EmptyChart,
} from "@/components/ClientsChart/ClientsChart";
import {
  ClientsTable,
  ClientsTableShell,
  TableSkeleton,
} from "@/components/ClientsTable/ClientsTable";
import { DataError } from "@/components/states/DataError";
import { ErrorBoundary } from "@/components/states/ErrorBoundary";
import { toChildStack } from "@/domain/childStack";
import { deepestExpanded, pathTo, rollUp } from "@/domain/clients";
import type { ClientsData } from "@/domain/schema";
import { useExpandedRows } from "@/hooks/useExpandedRows";
import styles from "./Dashboard.module.css";

export function Dashboard() {
  const clients = useClients();

  if (clients.data) return <DashboardContent data={clients.data} />;

  return (
    <main className="page">
      <h1 className="page__title">Clients</h1>

      <span className="visually-hidden" role="status" aria-live="polite">
        {clients.status === "loading" && "Loading client data…"}
      </span>

      <div className={styles.dashboard}>
        <section className={`card ${styles.panel}`} aria-label="Client trend">
          <div className={styles.chartPlaceholder}>
            {clients.status === "loading" ? (
              <ChartSkeleton />
            ) : (
              <EmptyChart message="No chart to show while the data is unavailable." />
            )}
          </div>
        </section>

        <section
          className={`card ${styles.panel} ${styles.panelTable}`}
          aria-label="Client breakdown"
        >
          <ClientsTableShell>
            {clients.status === "loading" ? (
              <TableSkeleton />
            ) : (
              <DataError error={clients.error} onRetry={clients.refetch} />
            )}
          </ClientsTableShell>
        </section>
      </div>
    </main>
  );
}

function DashboardContent({ data }: { data: ClientsData }) {
  const { months } = data;
  const root = useMemo(() => rollUp(data.root), [data.root]);
  const { expandedIds, toggle } = useExpandedRows([root.id]);

  const focus = useMemo(
    () => deepestExpanded(root, expandedIds),
    [root, expandedIds],
  );
  const stack = useMemo(() => toChildStack(focus, months), [focus, months]);
  const trail = useMemo(() => pathTo(root, focus.id), [root, focus]);

  const scope = focus.name;

  return (
    <main className="page">
      <h1 className="page__title">Clients</h1>

      <span className="visually-hidden" role="status" aria-live="polite">
        Client data loaded.
      </span>

      <div className={styles.dashboard}>
        <section
          className={`card ${styles.panel}`}
          aria-label={`Client trend for ${scope}`}
        >
          {trail.length > 0 && (
            <p className={styles.scope}>
              {trail.map((node, i) => (
                <span key={node.id}>
                  {i > 0 && (
                    <span className={styles.scopeSep} aria-hidden="true">
                      /
                    </span>
                  )}
                  {node.name}
                </span>
              ))}
            </p>
          )}

          <ErrorBoundary label="chart">
            <ClientsChart stack={stack} scopeLabel={focus.name} />
          </ErrorBoundary>
        </section>

        <section
          className={`card ${styles.panel} ${styles.panelTable}`}
          aria-label={`Client breakdown for ${scope}`}
        >
          <ErrorBoundary label="table">
            <ClientsTable
              root={root}
              months={months}
              expandedIds={expandedIds}
              onToggle={toggle}
            />
          </ErrorBoundary>
        </section>
      </div>
    </main>
  );
}
