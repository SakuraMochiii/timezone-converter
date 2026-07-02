import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MAJOR_CITIES, getTimezoneFromCoords } from '../utils/timezones';

function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const zone = getTimezoneFromCoords(e.latlng.lat, e.latlng.lng);
      onMapClick(zone);
    },
  });
  return null;
}

export default function WorldMap({ selectedZones, onAddZone, onRemoveZone }) {
  const selectedTimezones = new Set(selectedZones.map(z => z.timezone));

  return (
    <div className="map-container">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        style={{ height: '100%', width: '100%' }}
        worldCopyJump={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={onAddZone} />
        {MAJOR_CITIES.map(city => (
          <Marker
            key={city.timezone}
            position={[city.lat, city.lng]}
            icon={createIcon(selectedTimezones.has(city.timezone) ? '#4ade80' : '#94a3b8')}
            eventHandlers={{
              click: () => {
                if (selectedTimezones.has(city.timezone)) {
                  onRemoveZone(city.timezone);
                } else {
                  onAddZone(city);
                }
              },
            }}
          >
            <Popup>
              <strong>{city.name}</strong><br />
              {city.timezone}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
