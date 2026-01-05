import express from "express";
import path from "path";
import { NgsiClient } from "@uch/ngsi-client";
import crypto from "crypto";
import { buildRoadWorkEntity, buildRoadWorkAttrsPatch, buildRoadWorkFinishPatch } from "../../../domains/roadwork/ngsi";
import type { RoadWorkCreateInput, RoadWorkPatchInput } from "../../../domains/roadwork/model";
import { DomainValidationError } from "../../../domains/roadwork/errors";
import { toRoadWorkView } from "./mappers/roadwork.mapper";

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

app.use(express.json());

const ORION_BASE_URL = process.env.ORION_BASE_URL ?? "http://uch-orion-ld:1026";
const ROADWORK_CONTEXT_URL =
  process.env.ROADWORK_CONTEXT_URL ?? "http://uch-api:3000/contexts/roadwork.jsonld";

const ngsi = new NgsiClient({
  brokerUrl: ORION_BASE_URL,
  contextUrl: ROADWORK_CONTEXT_URL,
});


app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

app.get("/contexts/roadwork.jsonld", (_req, res) => {
  const contextPath = "/domains/roadwork/context.jsonld";
  res.setHeader("Content-Type", "application/ld+json");
  res.sendFile(contextPath);
});

app.post("/api/roadworks", async (req, res) => {
  try {
    const input = req.body as RoadWorkCreateInput;

    // 最小必填校验（仍然保留在 API 层，避免 domains 收到空对象）
    if (!input?.title || !input?.status || !input?.startDate || !input?.endDate || !input?.location) {
      return res.status(400).json({
        error: "Missing required fields: title, status, startDate, endDate, location",
      });
    }

    const entity = buildRoadWorkEntity(input);

    await ngsi.createEntity(entity);
    const created = await ngsi.getEntity(entity.id);
    return res.status(201).json(toRoadWorkView(created));
  } catch (e: any) {
    if (e instanceof DomainValidationError) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});


app.get("/api/roadworks", async (req, res) => {
  try {
    const status = req.query.status as string | undefined;

    const params: Record<string, string> = {
      type: "RoadWork",
    };

    // 可选过滤：status
    if (status) {
      const allowed = new Set(["planned", "ongoing", "finished"]);
      if (!allowed.has(status)) {
        return res.status(400).json({
          error: "Invalid status. Expected one of: planned | ongoing | finished",
        });
      }
      params.q = `status=="${status}"`;
    }

    const data = await ngsi.queryEntities(params);
    const list = Array.isArray(data) ? data : [];
    const views = list.map(toRoadWorkView);
    return res.status(200).json(views);
  } catch (e: any) {
    if (e instanceof DomainValidationError) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});

app.get("/api/roadworks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await ngsi.getEntity(id);

    if (data?.type !== "RoadWork") {
      return res.status(404).json({ error: "NotFound", message: "RoadWork not found" });
    }

    return res.status(200).json(toRoadWorkView(data));
  } catch (e: any) {
    if (e instanceof DomainValidationError) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});

app.patch("/api/roadworks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patch = req.body as RoadWorkPatchInput;

    const attrs = buildRoadWorkAttrsPatch(patch);

    if (Object.keys(attrs).length === 0) {
      return res.status(400).json({ error: "No updatable fields provided." });
    }

    // 1. 执行 PATCH
    await ngsi.patchEntity(id, attrs);

    // 2. 立即读取更新后的完整实体
    const updated = await ngsi.getEntity(id);

    // 3. 类型守门（可选但推荐）
    if (updated?.type !== "RoadWork") {
      return res.status(404).json({ error: "NotFound", message: "RoadWork not found" });
    }

    // 4. 返回完整实体
    return res.status(200).json(toRoadWorkView(updated));
  } catch (e: any) {
    if (e instanceof DomainValidationError) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});


app.post("/api/roadworks/:id/finish", async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body ?? {};

    const attrs = buildRoadWorkFinishPatch(endDate);

    // 1. 执行领域动作（PATCH）
    await ngsi.patchEntity(id, attrs);

    // 2. 读取更新后的完整实体
    const updated = await ngsi.getEntity(id);

    // 3. 类型守门（推荐）
    if (updated?.type !== "RoadWork") {
      return res.status(404).json({ error: "NotFound", message: "RoadWork not found" });
    }

    // 4. 返回完整实体
    return res.status(200).json(toRoadWorkView(updated));
  } catch (e: any) {
    if (e instanceof DomainValidationError) {
      return res.status(400).json({ error: e.message });
    }
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});


app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});

