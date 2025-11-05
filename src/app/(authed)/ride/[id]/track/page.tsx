
"use client";

import React, { useState, useEffect, use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Ride, rides as mockRides } from "@/lib/data";
import Map from "@/components/map";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// A simple utility for linear interpolation
const lerp = (start: number, end: number, amt: number) => (1 - amt) * start + amt * end;

// Haversine distance formula
const haversineDistance = (coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}) => {
    const toRad = (x: number) => x * Math.PI / 180;
    const R = 6371; // Earth radius in km

    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // in kilometers
};

export default function TrackRidePage({ params }: { params: { id: string } }) {
  const { id } = use(Promise.resolve(params));
  const [ride, setRide] = useState<Ride | undefined>(undefined);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [driverLocation, setDriverLocation] = useState<{lat: number, lng: number} | null>(null);
  const [eta, setEta] = useState<{ minutes: number, distance: number } | null>(null);

  useEffect(() => {
    const storedRides = localStorage.getItem("rides");
    const allRides: Ride[] = storedRides ? JSON.parse(storedRides).map((r: any) => ({...r, departureTime: new Date(r.departureTime)})) : mockRides;
    const currentRide = allRides.find((r) => r.id === id);
    setRide(currentRide);

    if (currentRide) {
      setDriverLocation(currentRide.startLocationCoords);
    }
  }, [id]);

  useEffect(() => {
    // Get user's live location
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      (error) => {
        console.error("Error getting user location:", error);
        // Fallback to a default location if permission is denied
        setUserLocation({ lat: 37.422, lng: -122.084 });
      },
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    // Simulate driver movement
    if (!ride || !driverLocation) return;

    const simulationInterval = setInterval(() => {
      setDriverLocation(prevDriverLocation => {
        if (!prevDriverLocation) return null;

        const destination = ride.destinationCoords;
        const progress = Math.random() * 0.05; // Simulate small random steps

        const nextLat = lerp(prevDriverLocation.lat, destination.lat, progress);
        const nextLng = lerp(prevDriverLocation.lng, destination.lng, progress);
        
        const newLocation = { lat: nextLat, lng: nextLng };

        // Check if driver has arrived
        const distanceToDestination = haversineDistance(newLocation, destination);
        if (distanceToDestination < 0.5) { // Arrived if less than 500m away
          clearInterval(simulationInterval);
          return destination;
        }

        return newLocation;
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(simulationInterval);
  }, [ride, driverLocation]);

  useEffect(() => {
    // Calculate ETA
    if (driverLocation && ride) {
        const distance = haversineDistance(driverLocation, ride.destinationCoords);
        const averageSpeed = 60; // km/h
        const timeHours = distance / averageSpeed;
        const timeMinutes = Math.round(timeHours * 60);
        setEta({ minutes: timeMinutes, distance: Math.round(distance) });
    }
  }, [driverLocation, ride]);


  if (!ride) {
    return <div>Loading ride details...</div>;
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapCenter = userLocation || ride.startLocationCoords;

  const mapMarkers = [
    ...(userLocation ? [{
      lat: userLocation.lat,
      lng: userLocation.lng,
      title: "Your Location",
      icon: { url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }
    }] : []),
    ...(driverLocation ? [{
      lat: driverLocation.lat,
      lng: driverLocation.lng,
      title: "Driver's Location",
      icon: {
          path: window.google?.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          rotation: 0, // This could be dynamic based on direction of travel
          fillColor: "#000000",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF"
      }
    }] : []),
    {
      lat: ride.destinationCoords.lat,
      lng: ride.destinationCoords.lng,
      title: "Destination"
    }
  ];
  
  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Live Ride Tracking</CardTitle>
                        <CardDescription>
                        {ride.startLocation} to {ride.destination}
                        </CardDescription>
                    </div>
                    {eta && (
                        <div className="text-right">
                            <p className="font-bold text-lg">{eta.minutes} min</p>
                            <p className="text-sm text-muted-foreground">{eta.distance} km away</p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="h-[400px] w-full p-0 rounded-b-lg overflow-hidden">
                <Map 
                    apiKey={apiKey || ''}
                    lat={mapCenter.lat}
                    lng={mapCenter.lng}
                    zoom={11}
                    markers={mapMarkers}
                />
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Ride Details</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 border">
                        <AvatarImage src={ride.driver.avatarUrl} alt={ride.driver.name} />
                        <AvatarFallback>{ride.driver.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{ride.driver.name}</p>
                        <p className="text-sm text-muted-foreground">Driver</p>
                    </div>
                </div>
                 <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="font-semibold">Vehicle</p>
                        <p className="text-muted-foreground">Tesla Model 3</p>
                    </div>
                    <div>
                        <p className="font-semibold">License Plate</p>
                        <p className="text-muted-foreground">ABC-1234</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
