import type { RoadWorkDTO } from "../types";
import { RoadWorkListItem } from "./RoadWorkListItem";

export function RoadWorkList({ items }: { items: RoadWorkDTO[] }) {
  return (
    <ul style={{ marginTop: 16 }}>
      {items.map((rw) => (
        <RoadWorkListItem key={rw.id} rw={rw} />
      ))}
    </ul>
  );
}
