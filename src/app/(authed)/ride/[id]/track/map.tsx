"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Car } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { Ride } from '@/lib/data';
import { Progress } from '@/components/ui/progress';

interface MapProps {
  ride: Ride;
}

const MapComponent: React.FC<MapProps> = ({ ride }) => {
  const [progress, setProgress] = useState(0);
  const mapImage = placeholderImages.find(p => p.id === 'map-placeholder');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  if (!mapImage) {
    return <div>Map not available</div>;
  }
  
  const estimatedTimeOfArrival = new Date(ride.departureTime.getTime() + (100 - progress) / 100 * 30 * 60 * 1000);

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-lg overflow-hidden border">
      <Image
        src={mapImage.imageUrl}
        alt="Map"
        layout="fill"
        objectFit="cover"
        className="dark:brightness-[0.4]"
        data-ai-hint={mapImage.imageHint}
      />
      <div 
        className="absolute transition-all duration-1000 ease-linear"
        style={{ left: `${progress}%`, top: '45%'}}
      >
        <div className="relative">
          <Car className="w-8 h-8 text-primary transform -translate-x-1/2" />
        </div>
      </div>

       <div className="absolute bottom-4 left-4 right-4 bg-background/80 backdrop-blur-sm p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{ride.startLocation} to {ride.destination}</h3>
            <span className="text-sm font-mono">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
           <div className="text-xs text-muted-foreground">
            Estimated Arrival: {estimatedTimeOfArrival.toLocaleTimeString()}
           </div>
      </div>
    </div>
  );
};

export default MapComponent;
