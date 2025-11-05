
"use server";

import { rides as mockRides, notifications as mockNotifications, Ride, Notification } from "@/lib/data";

// In a real app, these would be database operations.
// For this prototype, we'll simulate them and rely on client-side state management with localStorage.

const getRides = (): Ride[] => {
    // This function would fetch from a database. 
    // In the future, we can read from localStorage on the server-side if needed, but it's complex.
    // For now, actions will receive the state from the client or operate on a base state.
    return mockRides;
}

const getNotifications = (): Notification[] => {
    return mockNotifications;
}

export async function startRide(rideId: string) {
    try {
        // In a real app, you'd fetch rides from a DB here.
        // We'll rely on the client to send the current state or just update what will be stored in localStorage.
        const rideToUpdate = mockRides.find(r => r.id === rideId);
        if (!rideToUpdate) {
            return { success: false, error: "Ride not found." };
        }
        if (rideToUpdate.status !== 'upcoming') {
            return { success: false, error: "Ride cannot be started." };
        }

        // The client will update its state and persist to localStorage
        return { success: true };
    } catch (error) {
        console.error("Failed to start ride:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function cancelSpot(rideId: string, userId: string) {
    try {
        const rideToUpdate = mockRides.find(r => r.id === rideId);
         if (!rideToUpdate) {
            return { success: false, error: "Ride not found." };
        }

        const passengerIndex = rideToUpdate.passengers.findIndex(p => p.id === userId);
        if (passengerIndex === -1) {
            return { success: false, error: "You are not a passenger on this ride." };
        }

        // The client will update its state and persist to localStorage
        return { success: true, driverId: rideToUpdate.driver.id, destination: rideToUpdate.destination };

    } catch (error) {
         console.error("Failed to cancel spot:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}

export async function cancelRide(rideId: string) {
    try {
        const rideToUpdate = mockRides.find(r => r.id === rideId);
        if (!rideToUpdate) {
            return { success: false, error: "Ride not found." };
        }

        if (rideToUpdate.status !== 'active') {
             return { success: false, error: "Only active rides can be canceled." };
        }
       
        // The client will update its state and persist to localStorage
        return { success: true };
    } catch (error) {
        console.error("Failed to cancel ride:", error);
        return { success: false, error: "An unexpected error occurred." };
    }
}
