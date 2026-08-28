import { useTree } from "@api/useTree";
import { ChannelBarChart } from "@components/ChannelBarChart/ChannelBarChart";
import { ErrorState, LoadingState } from "@components/states/States";
import { TreeGrid } from "@components/TreeGrid/TreeGrid";
import { toChannelStack } from "@domain/channelStack";
import { useMemo } from "react";
import type { TreeNode } from "@/types";
import "./Dashboard.css";

export function Dashboard() {
  const tree = useTree();

  return (
    <div className="page">
      <h1 className="page__title">Clients</h1>
      {tree.status === "loading" && <LoadingState />}
      {tree.status === "error" && <ErrorState onRetry={tree.refetch} />}
      {tree.status === "ok" && <DashboardContent root={tree.data} />}
    </div>
  );
}

function DashboardContent({ root }: { root: TreeNode }) {
  const stack = useMemo(() => toChannelStack(root), [root]);

  return (
    <div className="dashboard">
      <section
        className="card dashboard__panel"
        aria-label={`Client trend for ${root.name}`}
      >
        <ChannelBarChart data={stack} scopeLabel={root.name} />
      </section>

      <section className="card dashboard__panel dashboard__panel--table">
        <TreeGrid root={root} />
      </section>
    </div>
  );
}
