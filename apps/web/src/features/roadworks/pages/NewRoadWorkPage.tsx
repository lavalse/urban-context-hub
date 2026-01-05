import { Link, useNavigate } from "react-router-dom";
import { useCreateRoadWork } from "../hooks/useCreateRoadWork";
import type { RoadWorkStatus } from "../types";

export function NewRoadWorkPage() {
  const nav = useNavigate();
  const create = useCreateRoadWork();

  return (
    <div style={{ padding: 16 }}>
      <h1>New RoadWork</h1>

      <div style={{ marginBottom: 12 }}>
        <Link to="/roadworks">← Back</Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const fd = new FormData(form);

          const title = String(fd.get("title") ?? "").trim();
          const description = String(fd.get("description") ?? "").trim();
          const status = String(fd.get("status") ?? "planned") as RoadWorkStatus;

          const startDate = String(fd.get("startDate") ?? "").trim();
          const endDate = String(fd.get("endDate") ?? "").trim();

          const lng = Number(fd.get("lng"));
          const lat = Number(fd.get("lat"));

          if (!title) return alert("title is required");
          if (!startDate) return alert("startDate is required (ISO8601)");
          if (!endDate) return alert("endDate is required (ISO8601)");
          if (!Number.isFinite(lng) || !Number.isFinite(lat)) return alert("lng/lat must be numbers");

          create.mutate(
            {
              title,
              description: description || undefined,
              status,
              startDate,
              endDate,
              location: { type: "Point", coordinates: [lng, lat] },
            },
            {
              onSuccess: (created) => {
                // created.id might be URN -> encode for path segment
                nav(`/roadworks/${encodeURIComponent(created.id)}`);
              },
            },
          );
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 520 }}>
          <label>
            Title
            <input name="title" style={{ display: "block", width: "100%" }} />
          </label>

          <label>
            Description
            <textarea name="description" style={{ display: "block", width: "100%", minHeight: 80 }} />
          </label>

          <label>
            Status
            <select name="status" defaultValue="planned">
              <option value="planned">planned</option>
              <option value="ongoing">ongoing</option>
              <option value="finished">finished</option>
            </select>
          </label>

          <label>
            StartDate (ISO8601)
            <input
              name="startDate"
              placeholder="2026-01-10T21:00:00+09:00"
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            EndDate (ISO8601)
            <input
              name="endDate"
              placeholder="2026-01-11T05:00:00+09:00"
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <label style={{ flex: 1 }}>
              Lng
              <input name="lng" placeholder="139.7671" style={{ display: "block", width: "100%" }} />
            </label>
            <label style={{ flex: 1 }}>
              Lat
              <input name="lat" placeholder="35.6812" style={{ display: "block", width: "100%" }} />
            </label>
          </div>

          <button type="submit" disabled={create.isPending}>
            {create.isPending ? "Creating..." : "Create"}
          </button>

          {create.error && (
            <p>Error: {(create.error as any).message ?? "Create failed"}</p>
          )}
        </div>
      </form>
    </div>
  );
}
