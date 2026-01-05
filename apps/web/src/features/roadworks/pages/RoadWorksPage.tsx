import { Link, useSearchParams } from "react-router-dom";
import type { RoadWorkStatus } from "../types";
import { useRoadWorks } from "../hooks/useRoadWorks";
import { useFinishRoadWork } from "../hooks/useFinishRoadWork";

function FinishButton({ id }: { id: string }) {
  const m = useFinishRoadWork(id);
  return (
    <button
      disabled={m.isPending}
      onClick={() => m.mutate()}
      style={{ marginLeft: 8 }}
    >
      {m.isPending ? "Finishing..." : "Finish"}
    </button>
  );
}

export function RoadWorksPage() {
  const [sp, setSp] = useSearchParams();
  const status = (sp.get("status") ?? "ongoing") as RoadWorkStatus;

  const q = useRoadWorks({ status });

  return (
    <div style={{ padding: 16 }}>
      <h1>RoadWorks</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Status:{" "}
          <select
            value={status}
            onChange={(e) => setSp({ status: e.target.value })}
          >
            <option value="planned">planned</option>
            <option value="ongoing">ongoing</option>
            <option value="finished">finished</option>
          </select>
        </label>

        <Link to="/roadworks/new">+ New</Link>
      </div>

      {q.isLoading && <p style={{ marginTop: 16 }}>Loading...</p>}

      {q.error && (
        <p style={{ marginTop: 16 }}>
          Error: {(q.error as any).message ?? "Unknown error"}
        </p>
      )}

      {!q.isLoading && !q.error && (
        <ul style={{ marginTop: 16 }}>
          {q.data?.map((rw) => (
            <li key={rw.id} style={{ marginBottom: 10 }}>
              <Link to={`/roadworks/${encodeURIComponent(rw.id)}`}>
                {rw.title}
              </Link>{" "}
              <small>({rw.status})</small>
              {rw.status !== "finished" && <FinishButton id={rw.id} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
