import { Link, useParams } from "react-router-dom";

export function RoadWorkDetailPage() {
  const { id } = useParams();

  return (
    <div style={{ padding: 16 }}>
      <h1>RoadWork Detail</h1>
      <p>id = {id}</p>

      <div style={{ display: "flex", gap: 12 }}>
        <Link to="/roadworks">Back</Link>
      </div>

      <p style={{ marginTop: 16 }}>Detail + edit form goes here</p>
    </div>
  );
}
