// components/MapListViewer.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/list.css';
import { ZoomControl } from 'react-leaflet';

// Fix default marker icon issues with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function getLatLon(props) {
  let lat = null, lon = null;
  props.forEach(p => {
    const val = parseFloat(p.value);
    if (p.field.toLowerCase().includes('lat')) lat = val;
    if (p.field.toLowerCase().includes('lon') || p.field.toLowerCase().includes('lng')) lon = val;
  });
  return (lat && lon) ? { lat, lon } : null;
}

export function MapListViewer({ objects }) {
  const markers = objects
    .map(obj => {
      const props = Array.isArray(obj.objectProperties?.$values)
        ? obj.objectProperties.$values
        : obj.objectProperties || [];

      const coords = getLatLon(props);
      if (!coords) return null;

      return {
        key: obj.objectId,
        name: obj.objectName,
        lat: coords.lat,
        lon: coords.lon,
      };
    })
    .filter(Boolean);

  const center = markers.length > 0 ? [markers[0].lat, markers[0].lon] : [0, 0];

  return (
    <MapContainer 
      center={center} 
      zoom={markers.length > 0 ? 5 : 2} 
      className="map-container"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      <ZoomControl position="topleft" />
      {markers.map(marker => (
        <Marker key={marker.key} position={[marker.lat, marker.lon]}>
          <Popup>{marker.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
