import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Satellite, ShieldAlert, Radio } from 'lucide-react';

// Create custom colored dot icons using SVG divIcons
const createDotIcon = (color, size = 16, pulse = false) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${pulse ? `<div style="
          position: absolute;
          width: ${size * 2}px;
          height: ${size * 2}px;
          border-radius: 50%;
          background-color: ${color};
          opacity: 0.35;
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        "></div>` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          background-color: ${color};
          border: 2px solid #ffffff;
          box-shadow: 0 0 10px ${color};
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  });
};

const satelliteIcon = createDotIcon('#00f2fe', 20, true);
const highDebrisIcon = createDotIcon('#f43f5e', 14);
const medDebrisIcon = createDotIcon('#f59e0b', 14);
const lowDebrisIcon = createDotIcon('#38bdf8', 12);
const stationIcon = createDotIcon('#10b981', 14);

export default function MissionMap({ mapData, missionName }) {
  const defaultPos = [48.8566, 2.3522];
  const satPos = mapData?.satellite_position 
    ? [mapData.satellite_position.lat, mapData.satellite_position.lng] 
    : defaultPos;

  const polylineCoords = mapData?.ground_track?.map(pt => [pt.lat, pt.lng]) || [
    [28.5728, -80.6490],
    [38.8951, -40.0000],
    [48.8566, 2.3522],
    [55.7558, 37.6173]
  ];

  return (
    <div className="relative w-full h-[400px] rounded-lg overflow-hidden border border-space-700 bg-space-900 shadow-xl">
      <div className="absolute top-3 left-3 z-[1000] bg-space-900/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-space-700/80 text-xs font-mono text-cyan-300 flex items-center gap-2 shadow-lg">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
        <span>LIVE GROUND TRACK & CONJUNCTION GEOMETRY</span>
      </div>

      <div className="absolute bottom-3 right-3 z-[1000] bg-space-900/90 backdrop-blur-md px-3 py-2 rounded-md border border-space-700/80 text-xs font-mono flex flex-col gap-1.5 shadow-lg">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Map Legend</div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-cyan-500/50"></span>
          <span>Mission Satellite</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          <span>High Risk Debris</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Medium Risk Debris</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Ground Telemetry</span>
        </div>
      </div>

      <MapContainer
        center={satPos}
        zoom={3}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Orbit Ground Track Line */}
        <Polyline
          positions={polylineCoords}
          pathOptions={{
            color: '#00f2fe',
            weight: 2,
            dashArray: '6, 8',
            opacity: 0.85
          }}
        />

        {/* Satellite Coverage Circle */}
        <Circle
          center={satPos}
          radius={(mapData?.coverage_radius_km || 1200) * 1000}
          pathOptions={{
            color: '#00f2fe',
            fillColor: '#00f2fe',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '4, 4'
          }}
        />

        {/* Satellite Marker */}
        <Marker position={satPos} icon={satelliteIcon}>
          <Popup>
            <div className="text-xs p-1 font-sans">
              <div className="font-bold text-cyan-400 text-sm">{mapData?.satellite_position?.label || missionName || "Satellite"}</div>
              <div className="text-slate-300 mt-1">Orbit Altitude: <span className="text-white font-mono">{mapData?.satellite_position?.alt_km || 550} km LEO</span></div>
              <div className="text-slate-300">Ground Sub-Point: <span className="text-white font-mono">{satPos[0]}°N, {satPos[1]}°E</span></div>
              <div className="text-emerald-400 font-semibold mt-1">Status: Active Track</div>
            </div>
          </Popup>
        </Marker>

        {/* Debris Points */}
        {mapData?.debris_markers?.map((deb, idx) => {
          const icon = deb.risk === 'High' ? highDebrisIcon : (deb.risk === 'Medium' ? medDebrisIcon : lowDebrisIcon);
          return (
            <Marker key={idx} position={[deb.lat, deb.lng]} icon={icon}>
              <Popup>
                <div className="text-xs p-1 font-sans">
                  <div className="font-bold text-amber-400">{deb.name}</div>
                  <div className="text-slate-300 mt-0.5">Catalog Classification: <span className="text-rose-400 font-semibold">{deb.risk} Conjunction Risk</span></div>
                  <div className="text-slate-400 text-[11px] mt-1">Tracked via Space Surveillance Network (SSN)</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Ground Stations */}
        {mapData?.ground_stations?.map((gs, idx) => (
          <Marker key={`gs-${idx}`} position={[gs.lat, gs.lng]} icon={stationIcon}>
            <Popup>
              <div className="text-xs p-1 font-sans">
                <div className="font-bold text-emerald-400">{gs.name}</div>
                <div className="text-slate-300 mt-0.5">Telemetry & Command Uplink Node</div>
                <div className="text-slate-400 text-[11px]">Elevation Mask: &gt; 5°</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
