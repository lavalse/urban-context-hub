import { createBrowserRouter, Navigate } from "react-router-dom";
import { RoadWorksPage } from "../features/roadworks/pages/RoadWorksPage";
import { NewRoadWorkPage } from "../features/roadworks/pages/NewRoadWorkPage";
import { RoadWorkDetailPage } from "../features/roadworks/pages/RoadWorkDetailPage";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/roadworks" replace /> },

  { path: "/roadworks", element: <RoadWorksPage /> },
  { path: "/roadworks/new", element: <NewRoadWorkPage /> },
  { path: "/roadworks/:id", element: <RoadWorkDetailPage /> },

  { path: "*", element: <div style={{ padding: 16 }}>Not Found</div> },
]);
