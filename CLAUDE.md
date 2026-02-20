# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Infrastructure (start first)
```bash
# Start Orion-LD + MongoDB + API container
docker compose -f infra/docker-compose.yml up -d

# Stop
docker compose -f infra/docker-compose.yml down
```

### API (apps/api)
```bash
cd apps/api
npm run dev       # ts-node-dev with hot reload (port 3000)
npm run build     # tsc compile to dist/
npm start         # run compiled dist/index.js
```

### Web (apps/web)
```bash
cd apps/web
npm run dev       # Vite dev server (port 5173, proxies /api to :3000)
npm run build     # tsc + vite build
npm run lint      # eslint
```

### Install (monorepo root)
```bash
npm install       # installs all workspaces
```

## Architecture

This is an **npm workspaces monorepo** with four layers:

```
Web UI (React)  →  API (Express)  →  Orion-LD (NGSI-LD broker)  →  MongoDB
```

### Layer responsibilities

**`domains/roadwork/`** — Domain model, shared by nothing at runtime but imported by `apps/api`. Contains:
- `model.ts` — Input types (`RoadWorkCreateInput`, `RoadWorkPatchInput`, `RoadWorkStatus`)
- `ngsi.ts` — Builders that convert domain inputs into NGSI-LD entity format
- `view.ts` — `RoadWorkView` type + `toRoadWorkView()` that strips NGSI-LD wrappers for the UI
- `errors.ts` — `DomainValidationError`
- `context.jsonld` — JSON-LD `@context` definition served by the API

**`packages/ngsi-client/`** — TypeScript class (`NgsiClient`) that speaks NGSI-LD v1 protocol to Orion-LD. Handles Link headers, `application/ld+json` content type, and NGSI-LD entity format. Consumed only by `apps/api`. Note: `main` points directly to `src/index.ts` (no build step).

**`apps/api/`** — Express 5 server on port 3000. All routes are in `src/index.ts`. Uses `NgsiClient` + domain builders to persist and retrieve entities. Serves the JSON-LD context at `/contexts/roadwork.jsonld`. The mapper at `src/mappers/roadwork.mapper.ts` is the anti-corruption layer between NGSI-LD normalized format and the clean `RoadWorkView` returned to the UI.

**`apps/web/`** — React 19 SPA. Feature-sliced under `src/features/roadworks/`:
- `api/` — raw fetch functions (`roadworks.api.ts`)
- `hooks/` — React Query wrappers (`useRoadWorks`, `useRoadWork`, `useCreateRoadWork`, `usePatchRoadWork`, `useFinishRoadWork`)
- `pages/` — `RoadWorksPage` (list + map), `NewRoadWorkPage`, `RoadWorkDetailPage`
- `components/` — `RoadWorkForm`, `RoadWorkList`, `RoadWorkListItem`, `RoadWorksMapPanel`
- `types.ts` — DTOs used by the web layer

Vite proxies `/api/*` and `/health` to `http://localhost:3000` in dev.

### NGSI-LD data flow

1. **Write**: domain input → `buildRoadWorkEntity()` / `buildRoadWorkAttrsPatch()` → NGSI-LD entity with `Property`/`GeoProperty` wrappers → `NgsiClient` POSTs/PATCHes to Orion-LD with inlined `@context`
2. **Read**: Orion-LD returns normalized format → `toRoadWorkView()` strips wrappers → plain `RoadWorkView` returned as JSON to the web app

Entity IDs follow the pattern `urn:ngsi-ld:RoadWork:<uuid>`.

### Environment variables (API)
| Variable | Default in Docker | Purpose |
|---|---|---|
| `PORT` | `3000` | Express listen port |
| `ORION_BASE_URL` | `http://uch-orion-ld:1026` | Orion-LD endpoint |
| `ROADWORK_CONTEXT_URL` | `http://uch-api:3000/contexts/roadwork.jsonld` | Context URL sent in NGSI-LD Link headers |

When running the API locally (outside Docker), set `ORION_BASE_URL=http://localhost:1026` and `ROADWORK_CONTEXT_URL=http://localhost:3000/contexts/roadwork.jsonld`.

## Conventions

- Forms use uncontrolled inputs with `defaultValue` + `FormData` (MVP approach, not React state).
- UI state (selected item, status filter) lives in URL search params, not component state.
- No test framework is configured.
