import { useClients } from "@api/useClients";
import { ChannelBarChart } from "@components/ChannelBarChart/ChannelBarChart";
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
import { toChannelStack } from "@domain/channelStack";
import { useMemo } from "react";
import "./Dashboard.css";

export function Dashboard() {
  const clients = useClients();
  const root = clients.data;

  const stack = useMemo(
    () => (root ? toChannelStack(root) : undefined),
    [root],
  );

  const scope = root?.name ?? "all clients";

  return (
    <main className="page">
      <h1 className="page__title">Clients</h1>

      <span className="visually-hidden" role="status" aria-live="polite">
        {clients.status === "loading" && "Loading client data…"}
        {clients.status === "ok" && "Client data loaded."}
      </span>

      <div className="dashboard">
        <section
          className="card dashboard__panel"
          aria-label={`Client trend for ${scope}`}
        >
          {root && stack ? (
            <ChannelBarChart data={stack} scopeLabel={root.name} />
          ) : (
            <div className="dashboard__chart-placeholder">
              {clients.status === "loading" ? (
                <ChartSkeleton />
              ) : (
                <ChartUnavailable />
              )}
            </div>
          )}
        </section>

        <section
          className="card dashboard__panel dashboard__panel--table"
          aria-label={`Client breakdown for ${scope}`}
        >
          {root ? (
            <ClientsTable root={root} />
          ) : (
            <ClientsTableShell>
              {clients.status === "loading" ? (
                <TableSkeleton />
              ) : (
                <DataError error={clients.error} onRetry={clients.refetch} />
              )}
            </ClientsTableShell>
          )}
        </section>
      </div>
    </main>
  );
}
