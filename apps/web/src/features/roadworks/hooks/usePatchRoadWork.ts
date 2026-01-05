import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PatchRoadWorkDTO, RoadWorkDTO } from "../types";
import { patchRoadWork } from "../api/roadworks.api";
import { roadworkKeys } from "./keys";

export function usePatchRoadWork(id: string) {
  const qc = useQueryClient();

  return useMutation<RoadWorkDTO, Error, PatchRoadWorkDTO>({
    mutationFn: (patch) => patchRoadWork(id, patch),
    onSuccess: async (updated) => {
      // Update detail cache immediately
      qc.setQueryData(roadworkKeys.detail(id), updated);
      // Lists may include this item, so invalidate lists
      await qc.invalidateQueries({ queryKey: roadworkKeys.all });
    },
  });
}
