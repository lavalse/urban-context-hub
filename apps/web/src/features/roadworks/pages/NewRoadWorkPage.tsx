import { Link } from "react-router-dom";

export function NewRoadWorkPage() {
  return (
    <div style={{ padding: 16 }}>
      <h1>New RoadWork</h1>
      <p>Form goes here</p>
      <Link to="/roadworks">Back</Link>
    </div>
  );
}
