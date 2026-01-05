import { Link, useSearchParams } from "react-router-dom";

export function RoadWorksPage() {
  const [sp, setSp] = useSearchParams();
  const status = sp.get("status") ?? "ongoing";

  return (
    <div style={{ padding: 16 }}>
      <h1>RoadWorks</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          Status:{" "}
          <select
            value={status}
            onChange={(e) => setSp({ status: e.target.value })}
          >
            <option value="planned">planned</option>
            <option value="ongoing">ongoing</option>
            <option value="finished">finished</option>
          </select>
        </label>

        <Link to="/roadworks/new">+ New</Link>
      </div>

      <p style={{ marginTop: 16 }}>List goes here (status = {status})</p>
    </div>
  );
}
