import { useClients } from "@api/useClients";
import { ChannelBarChart } from "@components/ChannelBarChart/ChannelBarChart";
import { ClientsTable } from "@components/ClientsTable/ClientsTable";
import { ErrorState, LoadingState } from "@components/states/States";
import { toChannelStack } from "@domain/channelStack";
import { useMemo } from "react";
import type { ClientNode } from "@/types";
import "./Dashboard.css";

export function Dashboard() {
  const tree = useClients();

  return (
    <div className="page">
      <h1 className="page__title">Clients</h1>
      {tree.status === "loading" && <LoadingState />}
      {tree.status === "error" && (
        <ErrorState error={tree.error} onRetry={tree.refetch} />
      )}
      {tree.status === "ok" && <DashboardContent root={tree.data} />}
    </div>
  );
}

function DashboardContent({ root }: { root: ClientNode }) {
  const stack = useMemo(() => toChannelStack(root), [root]);

  return (
    <div className="dashboard">
      <section
        className="card dashboard__panel"
        aria-label={`Client trend for ${root.name}`}
      >
        <ChannelBarChart data={stack} scopeLabel={root.name} />
      </section>

      <section
        className="card dashboard__panel dashboard__panel--table"
        aria-label={`Client breakdown for ${root.name}`}
      >
        <ClientsTable root={root} />
      </section>
    </div>
  );
}
