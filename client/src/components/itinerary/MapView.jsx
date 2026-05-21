import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapPinned, Route, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';

const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const MARKER_COLORS = [
  '#F59E0B',
  '#8B5CF6',
  '#3B82F6',
  '#10B981',
  '#F43F5E',
  '#06B6D4',
  '#A1A1AA',
];

function getCoordinate(stop) {
  const latitude = Number(stop.latitude ?? stop.lat);
  const longitude = Number(stop.longitude ?? stop.lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function formatStopMeta(stop) {
  return [stop.arrival_time, stop.dateLabel || stop.date_label].filter(Boolean).join(' · ');
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function calculateStraightDistance(from, to) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLng = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return '';
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters > 100000 ? 0 : 1)} km`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return '';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
}

function getMidpoint(coordinates) {
  return coordinates[Math.floor(coordinates.length / 2)];
}

function createFallbackSegment(from, to) {
  const coordinates = [
    [from.longitude, from.latitude],
    [to.longitude, to.latitude],
  ];
  const distanceMeters = calculateStraightDistance(from, to) * 1000;

  return {
    coordinates,
    distance: distanceMeters,
    duration: null,
    label: `${formatDistance(distanceMeters)} direct`,
  };
}

async function fetchRouteSegment(from, to, signal) {
  const coordinates = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const params = new URLSearchParams({
    overview: 'full',
    geometries: 'geojson',
    steps: 'false',
    alternatives: 'true',
  });
  const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`OSRM failed with ${response.status}`);
  const data = await response.json();
  const route = [...(data.routes || [])].sort((a, b) => Number(a.distance || Infinity) - Number(b.distance || Infinity))[0];
  if (!route?.geometry?.coordinates?.length) throw new Error('OSRM route missing geometry');

  return {
    coordinates: route.geometry.coordinates,
    distance: route.distance,
    duration: route.duration,
    label: `${formatDistance(route.distance)} · ${formatDuration(route.duration)}`,
  };
}

function toRouteCollection(segments) {
  return {
    type: 'FeatureCollection',
    features: segments.map((segment) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: segment.coordinates,
      },
      properties: {},
    })),
  };
}

function toLabelCollection(segments) {
  return {
    type: 'FeatureCollection',
    features: segments
      .filter((segment) => segment.coordinates.length > 0 && segment.label)
      .map((segment) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: getMidpoint(segment.coordinates),
        },
        properties: {
          label: segment.label,
        },
      })),
  };
}

export default function MapView({ stops = [], className, interactive = true }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [error, setError] = useState('');
  const [routeSegments, setRouteSegments] = useState([]);

  const mappedStops = useMemo(
    () =>
      stops
        .map((stop, index) => {
          const coordinate = getCoordinate(stop);
          if (!coordinate) return null;
          return {
            ...stop,
            ...coordinate,
            label: stop.place_name || stop.name || `Stop ${index + 1}`,
          };
        })
        .filter(Boolean),
    [stops],
  );

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadRoutes() {
      if (mappedStops.length < 2) {
        queueMicrotask(() => {
          if (!cancelled) setRouteSegments([]);
        });
        return;
      }

      const pairs = mappedStops.slice(0, -1).map((from, index) => [from, mappedStops[index + 1]]);

      try {
        const segments = await Promise.all(
          pairs.map(async ([from, to]) => {
            try {
              return await fetchRouteSegment(from, to, controller.signal);
            } catch (err) {
              if (controller.signal.aborted) throw err;
              console.warn('[MapView] Route lookup failed, using direct segment', err);
              return createFallbackSegment(from, to);
            }
          }),
        );
        if (!cancelled) setRouteSegments(segments);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error('[MapView] Failed to load route segments', err);
        }
      }
    }

    loadRoutes();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [mappedStops]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || mappedStops.length === 0) return undefined;

    const isDark = document.documentElement.classList.contains('dark') ||
      window.matchMedia?.('(prefers-color-scheme: dark)').matches;

    try {
      mapRef.current = new maplibregl.Map({
        container: containerRef.current,
        style: isDark ? DARK_STYLE : LIGHT_STYLE,
        center: [mappedStops[0].longitude, mappedStops[0].latitude],
        zoom: mappedStops.length > 1 ? 7 : 11,
        attributionControl: false,
        interactive,
      });

      mapRef.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
      if (interactive) mapRef.current.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');

      mapRef.current.on('error', (event) => {
        console.error('[MapView] MapLibre error', event.error);
        setError('Map could not load right now.');
      });
    } catch (err) {
      console.error('[MapView] Failed to initialize map', err);
      queueMicrotask(() => setError('Map could not load right now.'));
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [interactive, mappedStops]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mappedStops.length === 0) return undefined;

    const renderRoute = () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      if (map.getLayer('route-labels')) map.removeLayer('route-labels');
      if (map.getLayer('route-line')) map.removeLayer('route-line');
      if (map.getSource('route-labels')) map.removeSource('route-labels');
      if (map.getSource('route')) map.removeSource('route');

      mappedStops.forEach((stop, index) => {
        const markerNode = document.createElement('button');
        markerNode.type = 'button';
        markerNode.className = 'safarnama-map-marker';
        markerNode.style.setProperty('--marker-color', MARKER_COLORS[index % MARKER_COLORS.length]);
        markerNode.setAttribute('aria-label', `${index + 1}. ${stop.label}`);
        markerNode.textContent = String(index + 1);

        const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(`
          <div class="safarnama-map-popup">
            <strong>${stop.label}</strong>
            ${formatStopMeta(stop) ? `<span>${formatStopMeta(stop)}</span>` : ''}
          </div>
        `);

        const marker = new maplibregl.Marker({ element: markerNode, anchor: 'bottom' })
          .setLngLat([stop.longitude, stop.latitude])
          .setPopup(popup)
          .addTo(map);

        markersRef.current.push(marker);
      });

      if (mappedStops.length > 1) {
        const activeSegments = routeSegments.length > 0
          ? routeSegments
          : mappedStops.slice(0, -1).map((from, index) => createFallbackSegment(from, mappedStops[index + 1]));

        map.addSource('route', {
          type: 'geojson',
          data: toRouteCollection(activeSegments),
        });

        map.addSource('route-labels', {
          type: 'geojson',
          data: toLabelCollection(activeSegments),
        });

        map.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#60A5FA',
            'line-width': 3,
            'line-opacity': 0.85,
          },
        });

        map.addLayer({
          id: 'route-labels',
          type: 'symbol',
          source: 'route-labels',
          layout: {
            'text-field': ['get', 'label'],
            'text-size': 12,
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#FAFAFA',
            'text-halo-color': '#09090B',
            'text-halo-width': 2,
          },
        });

        const bounds = new maplibregl.LngLatBounds();
        mappedStops.forEach((stop) => bounds.extend([stop.longitude, stop.latitude]));
        map.fitBounds(bounds, { padding: 56, maxZoom: 12, duration: 600 });
      } else {
        map.flyTo({
          center: [mappedStops[0].longitude, mappedStops[0].latitude],
          zoom: 12,
          duration: 600,
        });
      }
    };

    if (map.loaded()) {
      renderRoute();
      return undefined;
    }

    map.once('load', renderRoute);
    return () => map.off('load', renderRoute);
  }, [mappedStops, routeSegments]);

  if (mappedStops.length === 0) {
    return (
      <div className={cn('flex min-h-[280px] items-center justify-center rounded-2xl border border-border bg-card text-center', className)}>
        <div className="max-w-xs px-6">
          <MapPinned className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No mapped stops yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add latitude and longitude to itinerary stops to render the route.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative h-[35vh] min-h-[300px] overflow-hidden rounded-2xl border border-border bg-card lg:h-[40vh]', className)}>
      <div ref={containerRef} className="h-full w-full" />
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-md border border-border bg-background/85 px-3 py-2 text-xs text-foreground backdrop-blur">
        <Route className="h-4 w-4 text-muted-foreground" />
        <span>{mappedStops.length} stop{mappedStops.length === 1 ? '' : 's'}</span>
      </div>
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-6 text-center">
          <div>
            <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-amber-400" />
            <p className="text-sm font-medium text-foreground">{error}</p>
            <p className="mt-1 text-xs text-muted-foreground">The itinerary timeline is still available below.</p>
          </div>
        </div>
      )}
    </div>
  );
}
