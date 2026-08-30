import { useClients } from "@api/useClients";
import { ClientsChart } from "@components/ClientsChart/ClientsChart";
import {
  ClientsTable,
  ClientsTableShell,
} from "@components/ClientsTable/ClientsTable";
import {
  ChartSkeleton,
  ChartUnavailable,
  DataError,
  TableSkeleton,
} from "@components/states/States";
import { toChildStack } from "@domain/childStack";
import { deepestExpanded, pathTo } from "@domain/clients";
import { useExpandedRows } from "@hooks/useExpandedRows";
import { useMemo } from "react";
import type { ClientNode } from "@/types";
import "./Dashboard.css";

export function Dashboard() {
  const clients = useClients();
  const root = clients.data;

  if (root) return <DashboardContent root={root} />;

  return (
    <main className="page">
      <h1 className="page__title">Clients</h1>

      <span className="visually-hidden" role="status" aria-live="polite">
        {clients.status === "loading" && "Loading client data…"}
      </span>

      <div className="dashboard">
        <section className="card dashboard__panel" aria-label="Client trend">
          <div className="dashboard__chart-placeholder">
            {clients.status === "loading" ? (
              <ChartSkeleton />
            ) : (
              <ChartUnavailable message="No chart to show while the data is unavailable." />
            )}
          </div>
        </section>

        <section
          className="card dashboard__panel dashboard__panel--table"
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

function DashboardContent({ root }: { root: ClientNode }) {
  const { expandedIds, toggle } = useExpandedRows([root.id]);

  const focus = useMemo(
    () => deepestExpanded(root, expandedIds),
    [root, expandedIds],
  );
  const stack = useMemo(() => toChildStack(focus), [focus]);
  const trail = useMemo(() => pathTo(root, focus.id), [root, focus]);

  const scope = focus.name;

  return (
    <main className="page">
      <h1 className="page__title">Clients</h1>

      <span className="visually-hidden" role="status" aria-live="polite">
        Client data loaded.
      </span>

      <div className="dashboard">
        <section
          className="card dashboard__panel"
          aria-label={`Client trend for ${scope}`}
        >
          {trail.length > 0 && (
            <p className="dashboard__scope">
              {trail.map((node, i) => (
                <span key={node.id}>
                  {i > 0 && (
                    <span className="dashboard__scope-sep" aria-hidden="true">
                      /
                    </span>
                  )}
                  {node.name}
                </span>
              ))}
            </p>
          )}

          <ClientsChart stack={stack} scopeLabel={focus.name} />
        </section>

        <section
          className="card dashboard__panel dashboard__panel--table"
          aria-label={`Client breakdown for ${scope}`}
        >
          <ClientsTable
            root={root}
            expandedIds={expandedIds}
            onToggle={toggle}
          />
        </section>
      </div>
    </main>
  );
}
