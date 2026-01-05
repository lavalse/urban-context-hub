import { Link, useParams } from "react-router-dom";
import { useRoadWork } from "../hooks/useRoadWork";
import { usePatchRoadWork } from "../hooks/usePatchRoadWork";
import { useFinishRoadWork } from "../hooks/useFinishRoadWork";

export function RoadWorkDetailPage() {
  const { id: rawId } = useParams();
  const id = rawId ? decodeURIComponent(rawId) : "";

  const q = useRoadWork(id);
  const patch = usePatchRoadWork(id);
  const finish = useFinishRoadWork(id);

  // Local form state (minimal)
  const title = q.data?.title ?? "";
  const description = q.data?.description ?? "";

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

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);

                const nextTitle = String(formData.get("title") ?? "").trim();
                const nextDescriptionRaw = String(formData.get("description") ?? "").trim();

                const patchPayload: any = {};
                if (nextTitle && nextTitle !== q.data.title) patchPayload.title = nextTitle;

                // Allow clearing description by sending empty string? (your backend may treat optional)
                // MVP: only set when changed, including empty => clears if API supports
                if (nextDescriptionRaw !== (q.data.description ?? "")) {
                  patchPayload.description = nextDescriptionRaw || undefined;
                }

                if (Object.keys(patchPayload).length === 0) {
                  alert("No changes");
                  return;
                }

                patch.mutate(patchPayload);
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 520 }}>
                <label>
                  Title
                  <input
                    name="title"
                    defaultValue={title}
                    style={{ display: "block", width: "100%" }}
                    key={`title-${q.data.id}-${q.data.title}`}
                  />
                </label>

                <label>
                  Description
                  <textarea
                    name="description"
                    defaultValue={description}
                    style={{ display: "block", width: "100%", minHeight: 80 }}
                    key={`desc-${q.data.id}-${q.data.description ?? ""}`}
                  />
                </label>

                <button type="submit" disabled={patch.isPending}>
                  {patch.isPending ? "Saving..." : "Save"}
                </button>

                {patch.error && (
                  <p>Error: {(patch.error as any).message ?? "Patch failed"}</p>
                )}
              </div>
            </form>
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
