export type RoadWorkStatus = "planned" | "ongoing" | "finished";

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type RoadWorkDTO = {
  id: string;
  type?: "RoadWork";
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string; // ISO8601
  endDate?: string;  // ISO8601
  location: GeoJSONPoint;
};

export type CreateRoadWorkDTO = {
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string;
  endDate?: string;
  location: GeoJSONPoint;
};

export type PatchRoadWorkDTO = Partial<{
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string;
  endDate?: string;
  location: GeoJSONPoint;
}>;
