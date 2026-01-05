import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateRoadWorkDTO, RoadWorkDTO } from "../types";
import { createRoadWork } from "../api/roadworks.api";
import { roadworkKeys } from "./keys";

export function useCreateRoadWork() {
  const qc = useQueryClient();

  return useMutation<RoadWorkDTO, Error, CreateRoadWorkDTO>({
    mutationFn: (input) => createRoadWork(input),
    onSuccess: async () => {
      // New item may affect any list
      await qc.invalidateQueries({ queryKey: roadworkKeys.all });
    },
  });
}
