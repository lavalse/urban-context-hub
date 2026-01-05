import type { RoadWorkDTO } from "../types";

type Props = {
  items: RoadWorkDTO[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
};

export function RoadWorksMapPanel({
  items,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: Props) {
  return (
    <div
      style={{
        height: "100%",
        borderLeft: "1px solid #333",
        padding: 12,
        overflow: "auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <h3 style={{ margin: 0 }}>Map (Placeholder)</h3>
        <div style={{ opacity: 0.8, fontSize: 12 }}>items: {items.length}</div>
      </div>

      <div style={{ marginTop: 12, fontSize: 13, lineHeight: 1.6 }}>
        <div>
          <b>selectedId:</b> {selectedId ?? "—"}
        </div>
        <div>
          <b>hoveredId:</b> {hoveredId ?? "—"}
        </div>
      </div>

      <hr style={{ margin: "12px 0" }} />

      {/* 纯占位：把 items 列出来，模拟 marker 列表 */}
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((rw) => {
          const isSelected = rw.id === selectedId;
          const isHovered = rw.id === hoveredId;

          return (
            <button
              key={rw.id}
              onMouseEnter={() => onHover?.(rw.id)}
              onMouseLeave={() => onHover?.(null)}
              onClick={() => onSelect?.(rw.id)}
              style={{
                textAlign: "left",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #444",
                background: isSelected
                  ? "#1e293b"
                  : isHovered
                    ? "#111827"
                    : "transparent",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 600 }}>{rw.title}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>{rw.status}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
