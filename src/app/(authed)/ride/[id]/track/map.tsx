"use client";

import React, { useState, useEffect } from 'react';
import { Car, Building, Home } from 'lucide-react';
import { Ride } from '@/lib/data';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface MapComponentProps {
  ride: Ride;
}

const SvgMap: React.FC<{ progress: number }> = ({ progress }) => {
    // A more interesting, curved path
    const pathD = "M 50 450 C 150 450, 150 150, 350 150 C 550 150, 550 350, 750 350";
    const pathRef = React.useRef<SVGPathElement>(null);
    const [carPosition, setCarPosition] = useState({ x: 50, y: 450 });

    useEffect(() => {
        if (pathRef.current) {
            const pathLength = pathRef.current.getTotalLength();
            const point = pathRef.current.getPointAtLength((progress / 100) * pathLength);
            setCarPosition({ x: point.x, y: point.y });
        }
    }, [progress]);

    return (
        <svg viewBox="0 0 800 500" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            {/* Background elements */}
            <rect width="800" height="500" fill="hsl(var(--card))" />
            
            {/* Grid lines */}
            <defs>
                <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5"/>
                </pattern>
                <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                    <rect width="100" height="100" fill="url(#smallGrid)"/>
                    <path d="M 100 0 L 0 0 0 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="1"/>
                </pattern>
            </defs>
            <rect width="800" height="500" fill="url(#grid)" />

            {/* The route path */}
            <path
                ref={pathRef}
                d={pathD}
                stroke="hsl(var(--primary) / 0.2)"
                strokeWidth="8"
                strokeDasharray="15 10"
                fill="none"
                strokeLinecap="round"
            />
            {/* Start and End points */}
            <g transform="translate(50, 450)">
                <Home className="text-primary" size={28} strokeWidth={1.5}/>
                <text x="35" y="18" fill="hsl(var(--foreground))" fontSize="14" fontFamily="sans-serif">Start</text>
            </g>
            <g transform="translate(750, 350)">
                 <Building className="text-primary" size={28} strokeWidth={1.5}/>
                 <text x="-60" y="18" fill="hsl(var(--foreground))" fontSize="14" fontFamily="sans-serif">Destination</text>
            </g>

             {/* Car Icon */}
            <g transform={`translate(${carPosition.x}, ${carPosition.y})`}>
                 <Car className="text-accent" size={32} strokeWidth={2} style={{ transform: 'translate(-16px, -16px)' }} />
            </g>
        </svg>
    );
};


const MapComponent: React.FC<MapComponentProps> = ({ ride }) => {
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState<Date | null>(null);
  const [minutesLeft, setMinutesLeft] = useState<number | null>(null);

  useEffect(() => {
    // This effect runs only on the client after hydration
    setProgress(0);
    const totalDurationMinutes = 30; // Mock duration

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Simulate faster progress
        const increment = Math.random() * 3 + 1; // 1 to 4
        const newProgress = Math.min(prev + increment, 100);

        // Calculate ETA inside the client-side effect
        const currentMinutesLeft = Math.round(totalDurationMinutes * (1 - newProgress / 100));
        setMinutesLeft(currentMinutesLeft);
        setEta(new Date(Date.now() + currentMinutesLeft * 60 * 1000));
        
        return newProgress;
      });
    }, 1500); // Update every 1.5 seconds

    return () => clearInterval(interval);
  }, [ride.id]);
  

  return (
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border bg-card">
        <SvgMap progress={progress} />

       <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-background/80 backdrop-blur-sm">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm sm:text-base">{ride.startLocation} to {ride.destination}</h3>
                    <span className="text-sm font-mono bg-muted text-muted-foreground rounded-md px-2 py-1">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 mb-3" />
                <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
                    <span>{eta ? `ETA: ${eta.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Calculating ETA...'}</span>
                    <span>{minutesLeft !== null ? (progress < 100 ? `${minutesLeft} min left` : 'Arrived') : ''}</span>
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default MapComponent;
