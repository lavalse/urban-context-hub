import { Link } from "react-router-dom";
import type { RoadWorkDTO } from "../types";
import { useFinishRoadWork } from "../hooks/useFinishRoadWork";

export function RoadWorkListItem({ rw }: { rw: RoadWorkDTO }) {
  const finish = useFinishRoadWork(rw.id);

  return (
    <li style={{ marginBottom: 10 }}>
      <Link to={`/roadworks/${encodeURIComponent(rw.id)}`}>{rw.title}</Link>{" "}
      <small>({rw.status})</small>

      {rw.status !== "finished" && (
        <button
          style={{ marginLeft: 8 }}
          disabled={finish.isPending}
          onClick={() => finish.mutate()}
        >
          {finish.isPending ? "Finishing..." : "Finish"}
        </button>
      )}
    </li>
  );
}
