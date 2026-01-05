import { Link, useSearchParams } from "react-router-dom";
import { useState } from "react";
import type { RoadWorkStatus } from "../types";
import { useRoadWorks } from "../hooks/useRoadWorks";
import { RoadWorkList } from "../components/RoadWorkList";
import { RoadWorksMapPanel } from "../components/RoadWorksMapPanel";

const isRoadWorkStatus = (v: string | null): v is RoadWorkStatus =>
  v === "planned" || v === "ongoing" || v === "finished";

export function RoadWorksPage() {
  const [sp, setSp] = useSearchParams();

  const statusParam = sp.get("status");
  const status: RoadWorkStatus = isRoadWorkStatus(statusParam) ? statusParam : "ongoing";

  const selectedId = sp.get("selected");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const q = useRoadWorks({ status });
  const items = q.data ?? [];

  const updateSp = (fn: (next: URLSearchParams) => void) => {
    const next = new URLSearchParams(sp);
    fn(next);
    setSp(next, { replace: true });
  };

  const setSelected = (id: string | null) => {
    updateSp((next) => {
      if (id) next.set("selected", id);
      else next.delete("selected");
    });
  };

  const setStatus = (s: RoadWorkStatus) => {
    updateSp((next) => {
      next.set("status", s);
      next.delete("selected"); // 切换 filter 时清掉选中，避免选中项不在当前列表
    });
  };

  return (
    <div style={{ padding: 16, height: "calc(100vh - 32px)" }}>
      <h1 style={{ marginTop: 0 }}>RoadWorks</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Status:{" "}
          <select value={status} onChange={(e) => setStatus(e.target.value as RoadWorkStatus)}>
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
        <div style={{ paddingRight: 12, overflow: "auto" }}>
          {q.isLoading && <p>Loading...</p>}
          {q.error && <p>Error: {(q.error as any).message ?? "Unknown error"}</p>}

          {!q.isLoading && !q.error && (
            <RoadWorkList
              items={items}
              selectedId={selectedId}
              onSelect={(id) => setSelected(id)}
              onHover={(id) => setHoveredId(id)}
            />
          )}
        </div>

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
