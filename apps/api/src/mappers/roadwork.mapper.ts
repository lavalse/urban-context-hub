import type { RoadWorkView } from "../../../../domains/roadwork/view";

/**
 * Convert NGSI-LD normalized RoadWork entity into RoadWorkView.
 * This is an anti-corruption layer: UI never sees NGSI-LD wrappers.
 */

function assertRoadWorkStatus(v: any): "planned" | "ongoing" | "finished" {
  if (v === "planned" || v === "ongoing" || v === "finished") return v;
  throw new Error(`toRoadWorkView: invalid status value: ${String(v)}`);
}


export function toRoadWorkView(entity: any): RoadWorkView {
  if (!entity || entity.type !== "RoadWork") {
    throw new Error("toRoadWorkView: entity is not RoadWork");
  }

  // Normalized NGSI-LD: { title: { type:"Property", value:"..." } }
  // In case broker returns key-values, we also allow raw values.
  const title = entity.title?.value ?? entity.title;
  const description = entity.description?.value ?? entity.description;

  const status = entity.status?.value ?? entity.status;
  const startDate = entity.startDate?.value ?? entity.startDate;
  const endDate = entity.endDate?.value ?? entity.endDate;

  // GeoProperty normalized: { location: { type:"GeoProperty", value: {...GeoJSON...} } }
  const location = entity.location?.value ?? entity.location;

  // Minimal validation: fail fast if unexpected shape
  if (typeof title !== "string") throw new Error("toRoadWorkView: invalid title");
  if (typeof status !== "string") throw new Error("toRoadWorkView: invalid status");
  if (typeof startDate !== "string") throw new Error("toRoadWorkView: invalid startDate");
  if (!location || location.type !== "Point" || !Array.isArray(location.coordinates)) {
    throw new Error("toRoadWorkView: invalid location");
  }

  return {
    id: entity.id,
    type: "RoadWork",
    title,
    ...(description ? { description } : {}),
    status: assertRoadWorkStatus(status),
    startDate,
    ...(endDate ? { endDate } : {}),
    location: {
      type: "Point",
      coordinates: location.coordinates as [number, number],
    },
  };
}
