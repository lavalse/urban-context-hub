import express from "express";
import path from "path";
import { NgsiClient } from "@uch/ngsi-client";
import crypto from "crypto";

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


app.listen(port, "0.0.0.0", () => {
  console.log(`API listening on http://0.0.0.0:${port}`);
});


app.post("/api/roadworks", async (req, res) => {
  try {
    const { id, title, description, status, startDate, endDate, location } = req.body ?? {};

    // 最小校验：先保证跑通
    if (!title || !status || !startDate || !endDate || !location) {
      return res.status(400).json({
        error: "Missing required fields: title, status, startDate, endDate, location",
      });
    }

    // 约定：location 必须是 GeoJSON Point
    // { "type": "Point", "coordinates": [lng, lat] }
    if (
      location?.type !== "Point" ||
      !Array.isArray(location?.coordinates) ||
      location.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: "Invalid location. Expected GeoJSON Point: {type:'Point', coordinates:[lng,lat]}",
      });
    }

    const entity: any = {
      id: id ?? `urn:ngsi-ld:RoadWork:${crypto.randomUUID()}`,
      type: "RoadWork",
      title: { type: "Property", value: title },
      status: { type: "Property", value: status },
      startDate: { type: "Property", value: startDate },
      endDate: { type: "Property", value: endDate },
      location: { type: "GeoProperty", value: location },
    };

    if (description) {
      entity.description = { type: "Property", value: description };
    }

    await ngsi.createEntity(entity);

    return res.status(201).json({ id: entity.id });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message ?? String(e) });
  }
});

