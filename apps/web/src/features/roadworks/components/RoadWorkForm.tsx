import type { CreateRoadWorkDTO, PatchRoadWorkDTO, RoadWorkDTO, RoadWorkStatus } from "../types";

type Mode = "create" | "edit";

type Props = {
  mode: Mode;
  initial?: Partial<RoadWorkDTO>; // edit mode uses this to prefill
  onSubmit: (payload: CreateRoadWorkDTO | PatchRoadWorkDTO) => void;
  submitting?: boolean;
  submitLabel?: string;
};

function isFiniteNumber(n: number) {
  return Number.isFinite(n) && !Number.isNaN(n);
}

export function RoadWorkForm(props: Props) {
  const { mode, initial, onSubmit, submitting, submitLabel } = props;

  const defaultStatus: RoadWorkStatus = (initial?.status as RoadWorkStatus) ?? "planned";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        const title = String(fd.get("title") ?? "").trim();
        const descriptionRaw = String(fd.get("description") ?? "").trim();
        const status = String(fd.get("status") ?? defaultStatus) as RoadWorkStatus;

        const startDate = String(fd.get("startDate") ?? "").trim();
        const endDate = String(fd.get("endDate") ?? "").trim();

        const lngStr = String(fd.get("lng") ?? "").trim();
        const latStr = String(fd.get("lat") ?? "").trim();
        const lng = lngStr === "" ? NaN : Number(lngStr);
        const lat = latStr === "" ? NaN : Number(latStr);

        if (mode === "create") {
          // create requires all required fields
          if (!title) return alert("title is required");
          if (!startDate) return alert("startDate is required (ISO8601)");
          if (!endDate) return alert("endDate is required (ISO8601)");
          if (!isFiniteNumber(lng) || !isFiniteNumber(lat)) return alert("lng/lat must be numbers");

          const payload: CreateRoadWorkDTO = {
            title,
            description: descriptionRaw || undefined,
            status,
            startDate,
            endDate,
            location: { type: "Point", coordinates: [lng, lat] },
          };
          onSubmit(payload);
          return;
        }

        // edit mode: create a patch with changed fields only (minimal)
        const patch: PatchRoadWorkDTO = {};

        if (title && title !== (initial?.title ?? "")) patch.title = title;

        // allow clearing description (send undefined if empty)
        const prevDesc = initial?.description ?? "";
        if (descriptionRaw !== prevDesc) patch.description = descriptionRaw || undefined;

        if (status !== (initial?.status ?? defaultStatus)) patch.status = status;

        if (startDate && startDate !== (initial?.startDate ?? "")) patch.startDate = startDate;
        if (endDate && endDate !== (initial?.endDate ?? "")) patch.endDate = endDate;

        // Only patch location if both numbers exist
        if (isFiniteNumber(lng) && isFiniteNumber(lat)) {
          const prev = initial?.location?.coordinates;
          const changed = !prev || prev[0] !== lng || prev[1] !== lat;
          if (changed) patch.location = { type: "Point", coordinates: [lng, lat] };
        }

        if (Object.keys(patch).length === 0) {
          alert("No changes");
          return;
        }

        onSubmit(patch);
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 520 }}>
        <label>
          Title
          <input
            name="title"
            defaultValue={initial?.title ?? ""}
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            defaultValue={initial?.description ?? ""}
            style={{ display: "block", width: "100%", minHeight: 80 }}
          />
        </label>

        <label>
          Status
          <select name="status" defaultValue={defaultStatus}>
            <option value="planned">planned</option>
            <option value="ongoing">ongoing</option>
            <option value="finished">finished</option>
          </select>
        </label>

        <label>
          StartDate (ISO8601)
          <input
            name="startDate"
            defaultValue={initial?.startDate ?? ""}
            placeholder="2026-01-10T21:00:00+09:00"
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <label>
          EndDate (ISO8601)
          <input
            name="endDate"
            defaultValue={initial?.endDate ?? ""}
            placeholder="2026-01-11T05:00:00+09:00"
            style={{ display: "block", width: "100%" }}
          />
        </label>

        <div style={{ display: "flex", gap: 8 }}>
          <label style={{ flex: 1 }}>
            Lng
            <input
              name="lng"
              defaultValue={initial?.location?.coordinates?.[0] ?? ""}
              placeholder="139.7671"
              style={{ display: "block", width: "100%" }}
            />
          </label>
          <label style={{ flex: 1 }}>
            Lat
            <input
              name="lat"
              defaultValue={initial?.location?.coordinates?.[1] ?? ""}
              placeholder="35.6812"
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : submitLabel ?? (mode === "create" ? "Create" : "Save")}
        </button>
      </div>
    </form>
  );
}
