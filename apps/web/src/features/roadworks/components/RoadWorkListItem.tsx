import { Link } from "react-router-dom";
import type { RoadWorkDTO } from "../types";
import { useFinishRoadWork } from "../hooks/useFinishRoadWork";

type Props = {
  rw: RoadWorkDTO;
  selected?: boolean;
  onSelect?: () => void;
  onHover?: (hovered: boolean) => void;
};

export function RoadWorkListItem({ rw, selected, onSelect, onHover }: Props) {
  const finish = useFinishRoadWork(rw.id);

  return (
    <li
      style={{
        marginBottom: 10,
        padding: 8,
        borderRadius: 8,
        border: "1px solid #444",
        background: selected ? "#1e293b" : "transparent",
        cursor: "pointer",
      }}
      onMouseEnter={() => onHover?.(true)}
      onMouseLeave={() => onHover?.(false)}
      onClick={() => onSelect?.()}
    >
      <Link
        to={`/roadworks/${encodeURIComponent(rw.id)}`}
        onClick={(e) => e.stopPropagation()} // 避免点详情时触发 select
      >
        {rw.title}
      </Link>{" "}
      <small>({rw.status})</small>

      {rw.status !== "finished" && (
        <button
          style={{ marginLeft: 8 }}
          disabled={finish.isPending}
          onClick={(e) => {
            e.stopPropagation(); // 避免触发 select
            finish.mutate();
          }}
        >
          {finish.isPending ? "Finishing..." : "Finish"}
        </button>
      )}
    </li>
  );
}
