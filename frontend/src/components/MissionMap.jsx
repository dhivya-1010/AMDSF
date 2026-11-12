import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center.length === 2 && !Number.isNaN(center[0]) && !Number.isNaN(center[1])) {
      map.setView(center, 3, { animate: true });
    }
  }, [center, map]);
  return null;
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createDotIcon = (color, size = 16, pulse = false) =>
  L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
        ${pulse ? `<div style="position:absolute;width:${size * 2}px;height:${size * 2}px;border-radius:50%;background-color:${color};opacity:0.35;animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>` : ''}
        <div style="width:${size}px;height:${size}px;border-radius:50%;background-color:${color};border:2px solid #ffffff;box-shadow:0 0 10px ${color};"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });

const satelliteIcon = createDotIcon('#00f2fe', 18, true);
const targetIcon = createDotIcon('#f59e0b', 14, true);
const debrisIcon = createDotIcon('#f43f5e', 12);
const stationIcon = createDotIcon('#10b981', 12);

// Split ground track at the anti-meridian (+180 / -180 wrap) so Leaflet never draws wrap-around stripes
function splitTrackSegments(points = []) {
  if (!points.length) return [];
  const segments = [];
  let current = [[points[0].lat, points[0].lng]];
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if (Math.abs(curr.lng - prev.lng) > 180) {
      if (current.length > 1) segments.push(current);
      current = [[curr.lat, curr.lng]];
    } else {
      current.push([curr.lat, curr.lng]);
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

export default function MissionMap({ mapData, missionName }) {
  const satPos = mapData?.satellite_position
    ? [mapData.satellite_position.lat, mapData.satellite_position.lng]
    : mapData?.target_location
    ? [mapData.target_location.lat, mapData.target_location.lng]
    : [0, 0];

  const targetLoc = mapData?.target_location;
  const trackSegments = splitTrackSegments(mapData?.ground_track || []);

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-space-700 bg-space-900 shadow-xl">
      <div className="absolute top-3 left-3 z-[1000] bg-space-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-space-700/80 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>SGP4 GROUND TRACK & SENSOR SWATH FOOTPRINT</span>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] bg-space-900/90 backdrop-blur-md px-3 py-2 rounded-md border border-space-700/80 text-xs font-mono flex flex-col gap-1.5 shadow-lg">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Map Legend</div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/50" />
          <span>Satellite & Swath</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Target Footprint</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Screened Catalog Object</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Launch Spaceport</span>
        </div>
      </div>

      <MapContainer center={satPos} zoom={3} scrollWheelZoom={true} className="w-full h-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapRecenter center={satPos} />

        {trackSegments.map((seg, i) => (
          <Polyline
            key={`track-${i}`}
            positions={seg}
            pathOptions={{
              color: '#00f2fe',
              weight: 2,
              dashArray: '6, 6',
              opacity: 0.85,
            }}
          />
        ))}

        {mapData?.satellite_position && (
          <>
            <Circle
              center={[mapData.satellite_position.lat, mapData.satellite_position.lng]}
              radius={(mapData?.coverage_radius_km || 200) * 1000}
              pathOptions={{
                color: '#00f2fe',
                fillColor: '#00f2fe',
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: '4, 4',
              }}
            />
            <Marker position={[mapData.satellite_position.lat, mapData.satellite_position.lng]} icon={satelliteIcon}>
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-cyan-600 text-sm">{missionName || 'Spacecraft'}</div>
                  <div>Altitude: {mapData.satellite_position.alt_km ?? '—'} km</div>
                  <div>Sub-point: {mapData.satellite_position.lat}°N, {mapData.satellite_position.lng}°E</div>
                  <div>Swath Width: {mapData?.swath_width_km ?? '—'} km</div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {targetLoc && targetLoc.lat != null && targetLoc.lng != null && (
          <>
            <Circle
              center={[targetLoc.lat, targetLoc.lng]}
              radius={(mapData?.target_radius_km || 100) * 1000}
              pathOptions={{
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.14,
                weight: 1.5,
              }}
            />
            <Marker position={[targetLoc.lat, targetLoc.lng]} icon={targetIcon}>
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-amber-600">{targetLoc.label || 'Target Region'}</div>
                  <div>Coordinates: {targetLoc.lat}°N, {targetLoc.lng}°E</div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {mapData?.debris_markers?.map((deb, idx) => (
          <Marker key={`deb-${idx}`} position={[deb.lat, deb.lng]} icon={debrisIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-rose-600">{deb.name} ({deb.norad_id})</div>
                <div>Min Separation: {deb.distance_km != null ? `${deb.distance_km} km` : '—'}</div>
                <div>TCA: {deb.tca || '—'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {mapData?.ground_stations?.map((gs, idx) => (
          <Marker key={`gs-${idx}`} position={[gs.lat, gs.lng]} icon={stationIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-emerald-600">{gs.name}</div>
                <div>Configured Launch Facility</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
