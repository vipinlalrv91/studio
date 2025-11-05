
'use server';

import { carpoolMatchingAssistant } from '@/ai/flows/carpool-matching-assistant';
import { AiInput } from '@/ai/flows/types';
import { rides as mockRides, notifications as mockNotifications, Notification, Ride, User } from '@/lib/data';

// This is a server-side representation. In a real app, you'd use a database.
// For the purpose of this demo, we'll simulate the data store.
let rides = [...mockRides];
let notifications = [...mockNotifications];

export async function findMatchingRides(query: string): Promise<{ success: boolean; rides?: Ride[]; error?: string; }> {
    console.log("Finding matching rides for query:", query);
    try {
        const availableRides = rides.filter(r => r.status === 'upcoming');
        const aiInput: AiInput = {
            query,
            availableRides,
        };
        const result = await carpoolMatchingAssistant(aiInput);
        
        // The assistant returns a list of ride IDs that are suggested matches.
        const matchedRides = rides.filter(ride => result.suggestedMatches.some((match: any) => match.rideId === ride.id));

        console.log("AI suggested matches:", result.suggestedMatches);
        console.log("Matched rides from data:", matchedRides);

        return { success: true, rides: matchedRides };
    } catch (error) {
        console.error("Error in findMatchingRides:", error);
        return { success: false, error: "Failed to get AI matches." };
    }
}

export async function startRide(rideId: string): Promise<{ success: boolean; error?: string }> {
    console.log("Starting ride:", rideId);

    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex === -1) {
        return { success: false, error: "Ride not found." };
    }

    const ride = rides[rideIndex];
    if (ride.status !== 'upcoming') {
        return { success: false, error: "Ride has already started or is completed." };
    }

    // Update ride status
    rides[rideIndex] = { ...ride, status: 'active' };

    // Create notifications for passengers
    const newNotifications: Notification[] = ride.passengers.map((passenger: User) => ({
        id: `n${Date.now()}${Math.random()}`,
        userId: passenger.id,
        read: false,
        message: `Your ride from ${ride.startLocation} to ${ride.destination} has started!`,
        timestamp: new Date(),
        type: 'ride-update',
        data: { rideId: ride.id, status: 'started' }
    }));

    notifications = [...notifications, ...newNotifications];

    console.log(`Ride ${rideId} started, ${newNotifications.length} notifications created.`);

    // Note: In a real app, this state change would be persisted in a database
    // and a push notification service would be triggered.
    // For this demo, we're just updating the in-memory array. The client will poll or use local storage events.
    
    return { success: true };
}
