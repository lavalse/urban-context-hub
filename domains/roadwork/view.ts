export type RoadWorkStatus = "planned" | "ongoing" | "finished";

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

/**
 * RoadWorkView: Domain-level read model (UI-friendly).
 * - No NGSI-LD Property/GeoProperty wrappers.
 * - No HTTP concerns.
 */
export type RoadWorkView = {
  id: string;
  type: "RoadWork";
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string; // ISO8601
  endDate?: string;  // ISO8601
  location: GeoJSONPoint;
};
