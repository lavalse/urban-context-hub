import { useQuery } from "@tanstack/react-query";
import type { RoadWorkDTO } from "../types";
import { getRoadWork } from "../api/roadworks.api";
import { roadworkKeys } from "./keys";

export function useRoadWork(id: string) {
  return useQuery<RoadWorkDTO>({
    queryKey: roadworkKeys.detail(id),
    queryFn: () => getRoadWork(id),
    enabled: !!id,
  });
}
