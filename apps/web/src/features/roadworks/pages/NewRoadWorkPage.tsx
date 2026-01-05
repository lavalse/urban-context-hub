import { Link, useNavigate } from "react-router-dom";
import { useCreateRoadWork } from "../hooks/useCreateRoadWork";
import { RoadWorkForm } from "../components/RoadWorkForm";
import type { CreateRoadWorkDTO } from "../types";

export function NewRoadWorkPage() {
  const nav = useNavigate();
  const create = useCreateRoadWork();

  return (
    <div style={{ padding: 16 }}>
      <h1>New RoadWork</h1>

      <div style={{ marginBottom: 12 }}>
        <Link to="/roadworks">← Back</Link>
      </div>

      <RoadWorkForm
        mode="create"
        submitting={create.isPending}
        onSubmit={(payload) => {
          create.mutate(payload as CreateRoadWorkDTO, {
            onSuccess: (created) => nav(`/roadworks/${encodeURIComponent(created.id)}`),
          });
        }}
      />

      {create.error && (
        <p style={{ marginTop: 12 }}>
          Error: {(create.error as any).message ?? "Create failed"}
        </p>
      )}
    </div>
  );
}
