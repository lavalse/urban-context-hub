import { useQuery } from "@tanstack/react-query";
import type { RoadWorkStatus, RoadWorkDTO } from "../types";
import { listRoadWorks } from "../api/roadworks.api";
import { roadworkKeys } from "./keys";

export function useRoadWorks(params: { status?: RoadWorkStatus }) {
  return useQuery<RoadWorkDTO[]>({
    queryKey: roadworkKeys.list(params),
    queryFn: () => listRoadWorks(params),
  });
}
