import crypto from "crypto";
import type { RoadWorkCreateInput, RoadWorkPatchInput } from "./model";
import { validateGeoPoint, validateRoadWorkStatus } from "./model";

export function buildRoadWorkEntity(input: RoadWorkCreateInput) {
  // minimal assertions (still lightweight)
  validateRoadWorkStatus(input.status);
  validateGeoPoint(input.location);

  const entity: any = {
    id: input.id ?? `urn:ngsi-ld:RoadWork:${crypto.randomUUID()}`,
    type: "RoadWork",
    title: { type: "Property", value: input.title },
    status: { type: "Property", value: input.status },
    startDate: { type: "Property", value: input.startDate },
    endDate: { type: "Property", value: input.endDate },
    location: { type: "GeoProperty", value: input.location },
  };

  if (input.description !== undefined) {
    entity.description = { type: "Property", value: input.description };
  }

  return entity;
}

export function buildRoadWorkAttrsPatch(patch: RoadWorkPatchInput) {
  const attrs: Record<string, any> = {};

  if (patch.title !== undefined) attrs.title = { type: "Property", value: patch.title };
  if (patch.description !== undefined) attrs.description = { type: "Property", value: patch.description };

  if (patch.status !== undefined) {
    validateRoadWorkStatus(patch.status);
    attrs.status = { type: "Property", value: patch.status };
  }

  if (patch.startDate !== undefined) attrs.startDate = { type: "Property", value: patch.startDate };
  if (patch.endDate !== undefined) attrs.endDate = { type: "Property", value: patch.endDate };

  if (patch.location !== undefined) {
    validateGeoPoint(patch.location);
    attrs.location = { type: "GeoProperty", value: patch.location };
  }

  return attrs;
}

export function buildRoadWorkFinishPatch(endDate?: string) {
  const finalEndDate = endDate ?? new Date().toISOString();
  return {
    status: { type: "Property", value: "finished" },
    endDate: { type: "Property", value: finalEndDate },
  };
}
