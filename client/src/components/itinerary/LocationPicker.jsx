import { useEffect, useMemo, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { LocateFixed, MapPin, Search, TriangleAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const MAP_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; CARTO, &copy; OpenStreetMap contributors',
    },
  },
  layers: [
    {
      id: 'carto',
      type: 'raster',
      source: 'carto',
    },
  ],
};
const INDIA_CENTER = [78.9629, 22.5937];

function hasCoordinates(value) {
  const lat = String(value?.lat ?? '').trim();
  const lng = String(value?.lng ?? '').trim();
  return lat !== '' && lng !== '' && Number.isFinite(Number(lat)) && Number.isFinite(Number(lng));
}

function toCenter(value) {
  return hasCoordinates(value) ? [Number(value.lng), Number(value.lat)] : INDIA_CENTER;
}

export default function LocationPicker({ value, onChange, className }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const initialCenterRef = useRef(toCenter(value));
  const initialZoomRef = useRef(hasCoordinates(value) ? 12 : 4);
  const [query, setQuery] = useState(value?.place_name || '');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const latestRef = useRef({ value, query: value?.place_name || '', onChange });

  const selectedLabel = useMemo(() => {
    if (!hasCoordinates(value)) return 'No location selected';
    return `${Number(value.lat).toFixed(5)}, ${Number(value.lng).toFixed(5)}`;
  }, [value]);

  useEffect(() => {
    latestRef.current = { value, query, onChange };
  }, [onChange, query, value]);

  const searchLocations = async (term, silent = false) => {
    const trimmed = term.trim();
    if (trimmed.length < 3) {
      setResults([]);
      if (!silent) setError('Type at least 3 characters.');
      return;
    }

    setSearching(true);
    if (!silent) setError('');

    try {
      const params = new URLSearchParams({
        q: trimmed,
        limit: '6',
        lang: 'en',
      });
      const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);
      if (!response.ok) throw new Error(`Search failed with ${response.status}`);
      const data = await response.json();
      const features = Array.isArray(data?.features) ? data.features : [];
      setResults(features);
      if (!features.length && !silent) setError('No places found. Try a more specific search.');
    } catch (err) {
      console.error('Location search failed', err);
      if (!silent) setError('Search failed. You can still click the map to pin a location.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 3) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      searchLocations(trimmed, true);
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return undefined;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: initialCenterRef.current,
      zoom: initialZoomRef.current,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.once('load', () => map.resize());
    window.setTimeout(() => map.resize(), 100);

    map.on('click', (event) => {
      const latest = latestRef.current;
      const nextValue = {
        ...latest.value,
        place_name: latest.value?.place_name || latest.query || 'Pinned location',
        lat: Number(event.lngLat.lat.toFixed(6)),
        lng: Number(event.lngLat.lng.toFixed(6)),
      };
      latest.onChange(nextValue);
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasCoordinates(value)) return;

    const coordinates = [Number(value.lng), Number(value.lat)];
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ color: '#FAFAFA' }).setLngLat(coordinates).addTo(map);
    } else {
      markerRef.current.setLngLat(coordinates);
    }

    map.flyTo({ center: coordinates, zoom: Math.max(map.getZoom(), 12), duration: 500 });
  }, [value]);

  const handleSearch = () => {
    searchLocations(query, false);
  };

  const selectResult = (result) => {
    const [lng, lat] = result.geometry?.coordinates || [];
    const props = result.properties || {};
    const placeName = props.name || [props.street, props.city, props.state].filter(Boolean).join(', ') || query;
    const nextValue = {
      ...value,
      place_name: placeName,
      lat: Number(lat),
      lng: Number(lng),
    };
    setQuery(nextValue.place_name);
    setResults([]);
    onChange(nextValue);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              const nextQuery = event.target.value;
              setQuery(nextQuery);
              if (nextQuery.trim().length < 3) setResults([]);
              onChange({ ...value, place_name: nextQuery });
            }}
            className="pl-9"
            placeholder="Search place, hotel, landmark, city"
          />
        </div>
        <Button type="button" onClick={handleSearch} disabled={searching} className="h-10 px-4">
          {searching ? 'Searching' : 'Search'}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-44 overflow-y-auto rounded-md border border-border bg-muted/40 p-1">
          {results.map((result) => {
            const props = result.properties || {};
            const title = props.name || [props.street, props.city].filter(Boolean).join(', ') || query;
            const subtitle = [props.street, props.city, props.state, props.country].filter(Boolean).join(', ');

            return (
            <button
              key={`${result.properties?.osm_id || title}-${result.geometry?.coordinates?.join(',')}`}
              type="button"
              onClick={() => selectResult(result)}
              className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-white/[0.06]"
            >
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-foreground">
                  {title}
                </span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{subtitle}</span>
              </span>
            </button>
            );
          })}
        </div>
      )}

      <div className="relative h-[320px] overflow-hidden rounded-xl border border-border bg-card">
        <div ref={mapContainerRef} className="h-full w-full" />
        <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-border bg-background/85 px-3 py-2 text-xs text-foreground backdrop-blur">
          <div className="flex items-center gap-2">
            <LocateFixed className="h-4 w-4 text-muted-foreground" />
            <span>Search or click the map</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{selectedLabel}</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-md border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
          <TriangleAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
