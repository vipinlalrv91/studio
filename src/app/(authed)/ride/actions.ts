
'use server';

import { carpoolMatchingAssistant } from '@/ai/flows/carpool-matching-assistant';
import { AiInput } from '@/ai/flows/types';
import { Ride, User } from '@/lib/data';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

// This is a server-side file, so you can't use localStorage.
// You'll need to implement a proper way to handle authentication tokens,
// for example, by using cookies. For this demo, we'll have to adjust
// how we get the token. A proper implementation would be to get it from cookies.
// For now, these functions that require auth will fail if called from server components
// without passing a token.
const getToken = () => {
    // This is a placeholder. In a real app, you'd get the token from the request headers/cookies.
    console.warn("getToken is a placeholder and will not work correctly on the server.");
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

export async function findMatchingRides(query: string): Promise<{ success: boolean; rides?: Ride[]; error?: string; }> {
    console.log("Finding matching rides for query:", query);
    try {
        const response = await axios.get(`${API_URL}/rides`);
        const allRides: any[] = response.data;
        
        // The backend doesn't have a 'status' field, so we filter rides that are in the future.
        const availableRides = allRides.filter((ride: any) => new Date(ride.departure_time) > new Date());
        
        // The AI flow expects a different data structure for rides. We need to adapt it.
        // This is a temporary solution. The backend should ideally return the data in the expected format.
        const formattedRides: Ride[] = availableRides.map((ride: any) => ({
            id: ride.id.toString(),
            driver: { id: ride.driver_id.toString(), name: 'Unknown Driver', avatar: '' }, // Fake driver info
            startLocation: ride.origin,
            destination: ride.destination,
            departure: new Date(ride.departure_time),
            availableSeats: ride.available_seats,
            passengers: [], // Fake passengers info
            status: 'upcoming' as const
        }));

        const aiInput: AiInput = {
            query,
            availableRides: formattedRides,
        };
        const result = await carpoolMatchingAssistant(aiInput);
        
        const matchedRides = formattedRides.filter(ride => result.suggestedMatches.some((match: any) => match.rideId.toString() === ride.id));

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

    // In a real app, you'd call a backend endpoint to update the ride status.
    // The current backend doesn't have this endpoint, so we're just logging it.
    console.warn("startRide is not fully implemented and does not update the backend.");

    // This is a mock implementation.
    // In a real app, you would make a POST/PUT request to your backend to update the ride status.
    // For example: await axios.post(`${API_URL}/rides/${rideId}/start`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
    
    return { success: true };
}

export async function getRides() {
  try {
    const response = await axios.get(`${API_URL}/rides`);
    return response.data;
  } catch (error) {
    console.error('Error getting rides:', error);
    throw new Error('Failed to get rides.');
  }
}

export async function getRide(id: string) {
  try {
    const response = await axios.get(`${API_URL}/rides/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error getting ride ${id}:`, error);
    throw new Error('Failed to get ride.');
  }
}

export async function createRide(rideData: { origin: string; destination: string; departure_time: string; available_seats: number }) {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    const response = await axios.post(`${API_URL}/rides`, rideData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating ride:', error);
    throw new Error('Failed to create ride.');
  }
}

export async function requestToJoinRide(rideId: string) {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    const response = await axios.post(`${API_URL}/rides/${rideId}/request`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error requesting to join ride:', error);
    throw new Error('Failed to request to join ride.');
  }
}

export async function updateRideRequest(rideId: string, requestId: string, status: 'accepted' | 'rejected') {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    const response = await axios.put(`${API_URL}/rides/${rideId}/requests/${requestId}`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating ride request:', error);
    throw new Error('Failed to update ride request.');
  }
}

export async function getNotifications() {
  try {
    const token = getToken();
    if (!token) throw new Error("Authentication token not found.");
    const response = await axios.get(`${API_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw new Error('Failed to get notifications.');
  }
}
