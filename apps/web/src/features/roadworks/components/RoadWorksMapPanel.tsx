import { useEffect, useMemo, useRef } from "react";
import maplibregl, {
  type GeoJSONSource,
  type Map as MLMap,
  type StyleSpecification,
} from "maplibre-gl";
import type { RoadWorkDTO } from "../types";

type Props = {
  items: RoadWorkDTO[];
  selectedId?: string | null;
  hoveredId?: string | null;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
};

const DEFAULT_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

const SOURCE_ID = "roadworks";
const LAYER_POINTS = "roadworks-points";
const LAYER_POINTS_HOVER = "roadworks-points-hover";
const LAYER_POINTS_SELECTED = "roadworks-points-selected";

function calcLngLatBounds(coords: Array<[number, number]>) {
  let minLng = Infinity,
    minLat = Infinity,
    maxLng = -Infinity,
    maxLat = -Infinity;

  for (const [lng, lat] of coords) {
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) continue;
    if (lng < minLng) minLng = lng;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lat > maxLat) maxLat = lat;
  }

  if (
    !Number.isFinite(minLng) ||
    !Number.isFinite(minLat) ||
    !Number.isFinite(maxLng) ||
    !Number.isFinite(maxLat)
  ) {
    return null;
  }

  return { minLng, minLat, maxLng, maxLat };
}

function toFeatureCollection(items: RoadWorkDTO[]) {
  return {
    type: "FeatureCollection" as const,
    features: items.map((rw) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: rw.location.coordinates,
      },
      properties: {
        id: rw.id,
        title: rw.title,
        status: rw.status,
      },
    })),
  };
}

export function RoadWorksMapPanel({
  items,
  selectedId,
  hoveredId,
  onSelect,
  onHover,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);

  // ✅ stale-closure fix: always call latest callbacks
  const onSelectRef = useRef<Props["onSelect"]>(onSelect);
  const onHoverRef = useRef<Props["onHover"]>(onHover);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  const fc = useMemo(() => toFeatureCollection(items), [items]);

  // 1) init map (once)
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: DEFAULT_STYLE,
      center: [136.8815, 35.1709], // 名古屋駅
      zoom: 12,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: fc as any,
      });

      // base points
      map.addLayer({
        id: LAYER_POINTS,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": 6,
          "circle-stroke-width": 1,
          "circle-stroke-color": "#000",
          "circle-color": "#ffffff",
        },
      });

      // hover points
      map.addLayer({
        id: LAYER_POINTS_HOVER,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": 8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000",
          "circle-color": "#ffffff",
        },
        filter: ["==", ["get", "id"], ""],
      });

      // selected points
      map.addLayer({
        id: LAYER_POINTS_SELECTED,
        type: "circle",
        source: SOURCE_ID,
        paint: {
          "circle-radius": 10,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#000",
          "circle-color": "#ffffff",
        },
        filter: ["==", ["get", "id"], ""],
      });

      // hover interactions
      map.on("mousemove", LAYER_POINTS, (e) => {
        map.getCanvas().style.cursor = "pointer";
        const f = e.features?.[0];
        const id = (f?.properties as any)?.id as string | undefined;
        if (id) onHoverRef.current?.(id);
      });

      map.on("mouseleave", LAYER_POINTS, () => {
        map.getCanvas().style.cursor = "";
        onHoverRef.current?.(null);
      });

      // click interaction
      map.on("click", LAYER_POINTS, (e) => {
        const f = e.features?.[0];
        const id = (f?.properties as any)?.id as string | undefined;
        if (id) onSelectRef.current?.(id);
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) update source data + auto fit
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const src = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
    if (!src) return;

    src.setData(fc as any);

    const coords = items.map((rw) => rw.location.coordinates);
    if (coords.length === 0) return;

    if (coords.length === 1) {
      const [lng, lat] = coords[0];
      if (!Number.isFinite(lng) || !Number.isFinite(lat)) return;

      map.flyTo({
        center: [lng, lat],
        zoom: Math.max(map.getZoom(), 13),
        duration: 400,
      });
      return;
    }

    const b = calcLngLatBounds(coords);
    if (!b) return;

    map.fitBounds(
      [
        [b.minLng, b.minLat],
        [b.maxLng, b.maxLat],
      ],
      {
        padding: 40,
        duration: 300,
        maxZoom: 15,
      }
    );
  }, [fc, items]);

  // 3) hoveredId / selectedId -> update filters
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer(LAYER_POINTS_HOVER)) return;

    map.setFilter(LAYER_POINTS_HOVER, ["==", ["get", "id"], hoveredId ?? ""]);
  }, [hoveredId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!map.getLayer(LAYER_POINTS_SELECTED)) return;

    map.setFilter(LAYER_POINTS_SELECTED, ["==", ["get", "id"], selectedId ?? ""]);
  }, [selectedId]);

  return (
    <div style={{ height: "100%", borderLeft: "1px solid #333" }}>
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}
