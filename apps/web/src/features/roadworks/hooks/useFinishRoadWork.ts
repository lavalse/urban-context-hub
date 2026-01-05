import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { RoadWorkDTO } from "../types";
import { finishRoadWork } from "../api/roadworks.api";
import { roadworkKeys } from "./keys";

export function useFinishRoadWork(id: string) {
  const qc = useQueryClient();

  return useMutation<RoadWorkDTO, Error, void>({
    mutationFn: () => finishRoadWork(id),
    onSuccess: async (updated) => {
      // Detail cache update
      qc.setQueryData(roadworkKeys.detail(id), updated);
      // If current list is "ongoing", item should disappear after finish
      await qc.invalidateQueries({ queryKey: roadworkKeys.all });
    },
  });
}
