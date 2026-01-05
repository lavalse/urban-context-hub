import { Link, useParams } from "react-router-dom";
import { useRoadWork } from "../hooks/useRoadWork";
import { usePatchRoadWork } from "../hooks/usePatchRoadWork";
import { useFinishRoadWork } from "../hooks/useFinishRoadWork";
import { RoadWorkForm } from "../components/RoadWorkForm";

export function RoadWorkDetailPage() {
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : "";

  const q = useRoadWork(id);
  const patch = usePatchRoadWork(id);
  const finish = useFinishRoadWork(id);

  // We'll use uncontrolled inputs via defaultValue + key to keep MVP simple
  // (later we can upgrade to proper form state management)
  if (!id) {
    return (
      <div style={{ padding: 16 }}>
        <p>Missing id</p>
        <Link to="/roadworks">Back</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>RoadWork Detail</h1>

      <div style={{ marginBottom: 12 }}>
        <Link to="/roadworks">← Back</Link>
      </div>

      {q.isLoading && <p>Loading...</p>}
      {q.error && <p>Error: {(q.error as any).message ?? "Unknown error"}</p>}

      {q.data && (
        <>
          <section style={{ marginTop: 12, padding: 12, border: "1px solid #ddd" }}>
            <div><strong>Title:</strong> {q.data.title}</div>
            <div><strong>Status:</strong> {q.data.status}</div>
            <div><strong>Start:</strong> {q.data.startDate}</div>
            <div><strong>End:</strong> {q.data.endDate ?? "-"}</div>
            <div>
              <strong>Location:</strong>{" "}
              {q.data.location.coordinates[0]}, {q.data.location.coordinates[1]}
            </div>
          </section>

          <section style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Edit (PATCH)</h2>

            <RoadWorkForm
              mode="edit"
              initial={q.data}
              submitting={patch.isPending}
              onSubmit={(payload) => patch.mutate(payload)}
              submitLabel="Save"
            />

            {patch.error && (
              <p style={{ marginTop: 12 }}>
                Error: {(patch.error as any).message ?? "Patch failed"}
              </p>
            )}
          </section>


          <section style={{ marginTop: 16 }}>
            <h2 style={{ marginBottom: 8 }}>Domain Action</h2>

            <button
              disabled={finish.isPending || q.data.status === "finished"}
              onClick={() => finish.mutate()}
            >
              {q.data.status === "finished"
                ? "Already finished"
                : finish.isPending
                ? "Finishing..."
                : "Finish RoadWork"}
            </button>

            {finish.error && (
              <p>Error: {(finish.error as any).message ?? "Finish failed"}</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
