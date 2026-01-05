import { apiFetch } from "../../../shared/api/http";
import type {
  RoadWorkDTO,
  RoadWorkStatus,
  CreateRoadWorkDTO,
  PatchRoadWorkDTO,
} from "../types";

export async function listRoadWorks(params?: { status?: RoadWorkStatus }): Promise<RoadWorkDTO[]> {
  const usp = new URLSearchParams();
  if (params?.status) usp.set("status", params.status);

  const qs = usp.toString();
  const path = qs ? `/api/roadworks?${qs}` : `/api/roadworks`;

  return apiFetch<RoadWorkDTO[]>(path);
}

export async function getRoadWork(id: string): Promise<RoadWorkDTO> {
  // id might include ":" and other characters; encode to be safe
  return apiFetch<RoadWorkDTO>(`/api/roadworks/${encodeURIComponent(id)}`);
}

export async function createRoadWork(input: CreateRoadWorkDTO): Promise<RoadWorkDTO> {
  return apiFetch<RoadWorkDTO>(`/api/roadworks`, {
    method: "POST",
    json: input,
  });
}

export async function patchRoadWork(id: string, patch: PatchRoadWorkDTO): Promise<RoadWorkDTO> {
  return apiFetch<RoadWorkDTO>(`/api/roadworks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    json: patch,
  });
}

export async function finishRoadWork(id: string): Promise<RoadWorkDTO> {
  return apiFetch<RoadWorkDTO>(`/api/roadworks/${encodeURIComponent(id)}/finish`, {
    method: "POST",
  });
}
