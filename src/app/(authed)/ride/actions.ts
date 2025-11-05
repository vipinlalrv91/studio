"use server";

import { rides, notifications } from "@/lib/data";

export async function startRide(rideId: string) {
    try {
        const ride = rides.find(r => r.id === rideId);
        if (!ride) {
            return { success: false, error: "Ride not found." };
        }
        if (ride.status !== 'upcoming') {
            return { success: false, error: "Ride cannot be started." };
        }

        ride.status = 'active';

        // Create notifications for passengers
        ride.passengers.forEach(passenger => {
            notifications.push({
                id: `n${notifications.length + 1}`,
                userId: passenger.id,
                read: false,
                message: `Your ride from ${ride.startLocation} to ${ride.destination} has started!`,
                timestamp: new Date(),
                type: 'ride-update',
                data: { rideId: ride.id, status: 'started' }
            });
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to start ride:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function cancelSpot(rideId: string, userId: string) {
    try {
        const ride = rides.find(r => r.id === rideId);
        if (!ride) {
            return { success: false, error: "Ride not found." };
        }

        const passengerIndex = ride.passengers.findIndex(p => p.id === userId);
        if (passengerIndex === -1) {
            return { success: false, error: "You are not a passenger on this ride." };
        }

        ride.passengers.splice(passengerIndex, 1);
        ride.availableSeats++;

        // Notify driver
        notifications.push({
            id: `n${notifications.length + 1}`,
            userId: ride.driver.id,
            read: false,
            message: `${userId} has canceled their spot on your ride to ${ride.destination}.`,
            timestamp: new Date(),
            type: 'ride-update',
            data: { rideId: ride.id, status: 'canceled' }
        });
        
        return { success: true };

    } catch (error) {
         console.error("Failed to cancel spot:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
