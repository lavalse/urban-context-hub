import type { RoadWorkStatus } from "../types";

export const roadworkKeys = {
  all: ["roadworks"] as const,
  list: (params: { status?: RoadWorkStatus }) => ["roadworks", "list", params] as const,
  detail: (id: string) => ["roadworks", "detail", { id }] as const,
};
