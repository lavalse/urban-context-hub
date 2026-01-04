import { DomainValidationError } from "./errors";

export type RoadWorkStatus = "planned" | "ongoing" | "finished";

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};

export type RoadWorkCreateInput = {
  id?: string;
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string; // ISO8601
  endDate: string;   // ISO8601
  location: GeoJSONPoint;
};

export type RoadWorkPatchInput = Partial<Pick<
  RoadWorkCreateInput,
  "title" | "description" | "status" | "startDate" | "endDate" | "location"
>>;

export function validateRoadWorkStatus(x: any): void {
  if (!["planned", "ongoing", "finished"].includes(x)) {
    throw new Error("Invalid status. Expected one of: planned | ongoing | finished");
  }
}


export function validateGeoPoint(x: any): void {
  if (
    x?.type !== "Point" ||
    !Array.isArray(x?.coordinates) ||
    x.coordinates.length !== 2 ||
    typeof x.coordinates[0] !== "number" ||
    typeof x.coordinates[1] !== "number"
  ) {
    throw new Error(
      "Invalid location. Expected GeoJSON Point: {type:'Point', coordinates:[lng,lat]}"
    );
  }
}
