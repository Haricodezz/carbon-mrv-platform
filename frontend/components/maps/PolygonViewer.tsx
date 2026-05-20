'use client';

import {
  MapContainer,
  TileLayer,
  Polygon,
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';


interface PolygonViewerProps {
  polygonCoordinates: string;
}


export default function PolygonViewer({
  polygonCoordinates,
}: PolygonViewerProps) {
  const coordinates: [
    number,
    number
  ][] = JSON.parse(
    polygonCoordinates
  ).map(
    (
      point: [
        number,
        number
      ]
    ) => [
      point[1],
      point[0],
    ]
  );

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border">
      <MapContainer
        center={
          coordinates[0]
        }
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={
            coordinates
          }
        />
      </MapContainer>
    </div>
  );
}