import type { RoadWorkDTO } from "../types";
import { RoadWorkListItem } from "./RoadWorkListItem";

type Props = {
  items: RoadWorkDTO[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
};

export function RoadWorkList({ items, selectedId, onSelect, onHover }: Props) {
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 16 }}>
      {items.map((rw) => (
        <RoadWorkListItem
          key={rw.id}
          rw={rw}
          selected={rw.id === selectedId}
          onSelect={() => onSelect?.(rw.id)}
          onHover={(hovered) => onHover?.(hovered ? rw.id : null)}
        />
      ))}
    </ul>
  );
}
