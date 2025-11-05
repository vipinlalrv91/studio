
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

  // Effect to handle script loading and map initialization
  useEffect(() => {
    const initMap = () => {
      if (mapRef.current && !mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom,
          disableDefaultUI: true,
        });
      }
    };

    const scriptId = 'google-maps-script';
    const existingScript = document.getElementById(scriptId);

    if (!existingScript) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initMap;
      document.head.appendChild(script);
    } else if (window.google && window.google.maps) {
        initMap();
    }
  }, [apiKey, lat, lng, zoom]);

  // Effect to update map center and zoom
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(zoom);
    }
  }, [lat, lng, zoom]);

  // Effect to handle markers
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
