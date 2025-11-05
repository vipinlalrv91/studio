
"use client";

import { useEffect, useRef } from 'react';

interface MarkerData {
  lat: number;
  lng: number;
  title?: string;
  icon?: google.maps.Icon;
}

interface MapProps {
  apiKey: string;
  lat: number;
  lng: number;
  zoom: number;
  markers?: MarkerData[];
}

const Map: React.FC<MapProps> = ({ apiKey, lat, lng, zoom, markers }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstances = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const loadMap = () => {
      if (window.google && window.google.maps) {
        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat, lng },
            zoom,
          });
        }
      }
    };

    if (!window.google || !window.google.maps) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = loadMap;
      document.head.appendChild(script);
    } else {
      loadMap();
    }
  }, [apiKey, lat, lng, zoom]);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat, lng });
    }
  }, [lat, lng]);

  useEffect(() => {
    if (mapInstance.current && markers) {
      // Clear existing markers
      markerInstances.current.forEach(marker => marker.setMap(null));
      markerInstances.current = [];

      // Add new markers
      markers.forEach(markerData => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: mapInstance.current,
          title: markerData.title,
          icon: markerData.icon,
        });
        markerInstances.current.push(marker);
      });
    }
  }, [markers]);


  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default Map;
