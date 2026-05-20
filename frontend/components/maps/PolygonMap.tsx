'use client';

import { useRef } from 'react';

import {
  MapContainer,
  TileLayer,
  FeatureGroup,
} from 'react-leaflet';

import {
  EditControl,
} from 'react-leaflet-draw';

import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';


interface PolygonMapProps {
  onPolygonComplete: (
    polygonCoordinates: string
  ) => void;
}


export default function PolygonMap({
  onPolygonComplete,
}: PolygonMapProps) {
  const featureGroupRef =
    useRef<L.FeatureGroup | null>(
      null
    );

  const handleCreated = (
    e: { layer: L.Layer }
  ) => {
    const layer = e.layer;

    if (!(layer instanceof L.Polygon)) {
      return;
    }

    const rings =
      layer.getLatLngs() as L.LatLng[][];

    const outerRing =
      rings[0] ?? [];

    const coordinates =
      outerRing.map(
        (point: L.LatLng) => [
          point.lng,
          point.lat,
        ]
      );

    onPolygonComplete(
      JSON.stringify(
        coordinates
      )
    );
  };

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border">
      <MapContainer
        center={
          [
            23.5937,
            80.9629,
          ] as [
            number,
            number
          ]
        }
        zoom={5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup
          ref={featureGroupRef}
        >
          <EditControl
            position="topright"
            onCreated={
              handleCreated
            }
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
              polygon: true,
            }}
          />
        </FeatureGroup>
      </MapContainer>
    </div>
  );
}