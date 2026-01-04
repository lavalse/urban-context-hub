# RoadWorks API Contract (for Web UI)

> Repo: `urban-context-hub`  
> Scope: **Frontend ↔ Apps/API** contract (UI never talks to NGSI-LD / Orion-LD directly)  
> Status: Draft for MVP v0.3 (UI start)  
> Principles:
> - UI only calls **our API** (`apps/api`)
> - API encapsulates all NGSI-LD concerns and context handling
> - RoadWork is an **UrbanEvent subtype**, not a CRUD demo object

---

## 0. Base

- Base URL (local): `http://localhost:3000`
- API prefix: `/api`
- Resource: `/api/roadworks`

### Content-Type

- Request: `application/json`
- Response: `application/json`

> Note: NGSI-LD `application/ld+json` / `Link` header strategy is **internal** to API and must not leak to UI.

---

## 1. Data Types (DTO)

### 1.1 Shared Types

```ts
export type RoadWorkStatus = "planned" | "ongoing" | "finished";

export type GeoJSONPoint = {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
};
```

### 1.2 RoadWorkDTO (Response shape)

```ts
export type RoadWorkDTO = {
  id: string;
  type?: "RoadWork";
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string;
  endDate?: string;
  location: GeoJSONPoint;
};
```

### 1.3 CreateRoadWorkDTO (Request body)

```ts
export type CreateRoadWorkDTO = {
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string;
  endDate?: string;
  location: GeoJSONPoint;
};
```

### 1.4 PatchRoadWorkDTO (Request body)

```ts
export type PatchRoadWorkDTO = Partial<{
  title: string;
  description?: string;
  status: RoadWorkStatus;
  startDate: string;
  endDate?: string;
  location: GeoJSONPoint;
}>;
```

---

## 2. Error Format

### 2.1 Domain Validation Error (HTTP 400)

```json
{
  "error": "DomainValidationError",
  "message": "Validation failed",
  "details": [
    { "path": "title", "reason": "required" },
    { "path": "startDate", "reason": "invalid ISO8601" }
  ]
}
```

### 2.2 System Error (HTTP 500)

```json
{
  "error": "InternalServerError",
  "message": "Unexpected error"
}
```

### 2.3 Not Found (HTTP 404)

```json
{
  "error": "NotFound",
  "message": "RoadWork not found"
}
```

---

## 3. Endpoints

### 3.1 Create RoadWork

**POST** `/api/roadworks`

```json
{
  "title": "Night road maintenance",
  "description": "Lane closure near station",
  "status": "planned",
  "startDate": "2026-01-10T21:00:00+09:00",
  "endDate": "2026-01-11T05:00:00+09:00",
  "location": { "type": "Point", "coordinates": [139.7671, 35.6812] }
}
```

### 3.2 List RoadWorks

**GET** `/api/roadworks?status=ongoing`

```json
[
  {
    "id": "urn:ngsi-ld:RoadWork:tokyo:0100",
    "type": "RoadWork",
    "title": "Ongoing work A",
    "status": "ongoing",
    "startDate": "2026-01-05T09:00:00+09:00",
    "location": { "type": "Point", "coordinates": [139.75, 35.68] }
  }
]
```

### 3.3 Get RoadWork by ID

**GET** `/api/roadworks/:id`

```json
{
  "id": "urn:ngsi-ld:RoadWork:tokyo:0100",
  "type": "RoadWork",
  "title": "Ongoing work A",
  "status": "ongoing",
  "startDate": "2026-01-05T09:00:00+09:00",
  "location": { "type": "Point", "coordinates": [139.75, 35.68] }
}
```

### 3.4 Patch RoadWork

**PATCH** `/api/roadworks/:id`

```json
{
  "title": "Updated title"
}
```

### 3.5 Finish RoadWork

**POST** `/api/roadworks/:id/finish`

```json
{
  "status": "finished",
  "endDate": "2026-01-05T16:45:12+09:00"
}
```

---

## Appendix A — Future GIS / Map Design Notes

- UI should query by `bbox`, not fetch all.
- API remains the abstraction layer.
- Geometry may evolve from Point → LineString / Polygon.
