
'use server';

import { carpoolMatchingAssistant } from '@/ai/flows/carpool-matching-assistant';
import { AiInput } from '@/ai/flows/types';
import { Ride } from '@/lib/data';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export async function findMatchingRides(query: string): Promise<{ success: boolean; rides?: Ride[]; error?: string; }> {
    console.log("Finding matching rides for query:", query);
    try {
        const response = await axios.get(`${API_URL}/rides`);
        const allRides: any[] = response.data;
        
        const availableRides = allRides.filter((ride: any) => new Date(ride.departure_time) > new Date());
        
        const formattedRides: Ride[] = availableRides.map((ride: any) => ({
            id: ride.id.toString(),
            driver: { id: ride.driver_id.toString(), name: 'Unknown Driver', avatar: '' }, 
            startLocation: ride.origin,
            destination: ride.destination,
            departure: new Date(ride.departure_time),
            availableSeats: ride.available_seats,
            passengers: [],
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
    console.warn("startRide is not fully implemented and does not update the backend.");
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

export async function createRide(rideData: { origin: string; destination: string; departure_time: string; available_seats: number }, token: string) {
  try {
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

export async function requestToJoinRide(rideId: string, token: string) {
  try {
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

export async function updateRideRequest(rideId: string, requestId: string, status: 'accepted' | 'rejected', token: string) {
  try {
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

export async function getNotifications(token: string) {
  try {
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
