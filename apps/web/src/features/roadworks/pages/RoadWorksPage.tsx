import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import type { RoadWorkStatus } from "../types";
import { useRoadWorks } from "../hooks/useRoadWorks";
import { RoadWorkList } from "../components/RoadWorkList";
import { RoadWorksMapPanel } from "../components/RoadWorksMapPanel";

export function RoadWorksPage() {
  const [sp, setSp] = useSearchParams();

  const status = (sp.get("status") ?? "ongoing") as RoadWorkStatus;
  const selectedId = sp.get("selected");

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const q = useRoadWorks({ status });
  const items = q.data ?? [];

  const setSelected = (id: string | null) => {
    const next = new URLSearchParams(sp);
    if (id) next.set("selected", id);
    else next.delete("selected");
    setSp(next, { replace: true });
  };

  return (
    <div style={{ padding: 16, height: "calc(100vh - 32px)" }}>
      <h1 style={{ marginTop: 0 }}>RoadWorks</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Status:{" "}
          <select
            value={status}
            onChange={(e) => {
              const next = new URLSearchParams(sp);
              next.set("status", e.target.value);
              next.delete("selected"); // 切换 filter 时清掉选中项（避免选中不在列表里）
              setSp(next, { replace: true });
            }}
          >
            <option value="planned">planned</option>
            <option value="ongoing">ongoing</option>
            <option value="finished">finished</option>
          </select>
        </label>

        <Link to="/roadworks/new">+ New</Link>
      </div>

      <div
        style={{
          marginTop: 16,
          height: "calc(100% - 88px)",
          display: "grid",
          gridTemplateColumns: "420px 1fr",
        }}
      >
        {/* Left: list */}
        <div style={{ paddingRight: 12, overflow: "auto" }}>
          {q.isLoading && <p>Loading...</p>}

          {q.error && (
            <p>
              Error: {(q.error as any).message ?? "Unknown error"}
            </p>
          )}

          {!q.isLoading && !q.error && (
            <RoadWorkList
              items={items}
              selectedId={selectedId}
              onSelect={(id) => setSelected(id)}
              onHover={(id) => setHoveredId(id)}
            />
          )}
        </div>

        {/* Right: map placeholder */}
        <div style={{ overflow: "hidden" }}>
          <RoadWorksMapPanel
            items={items}
            selectedId={selectedId}
            hoveredId={hoveredId}
            onSelect={(id) => setSelected(id)}
            onHover={(id) => setHoveredId(id)}
          />
        </div>
      </div>
    </div>
  );
}
