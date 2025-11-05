"use server";

import { carpoolMatchingAssistant, CarpoolMatchingInput } from "@/ai/flows/carpool-matching-assistant";
import { rides } from "@/lib/data";

export async function getAiMatches(input: { schedule: string, preferences: string }) {
    try {
        const ridesString = rides
            .filter(r => r.status === 'upcoming')
            .map(r => `Ride from ${r.startLocation} to ${r.destination} at ${r.departureTime.toLocaleString()} with ${r.availableSeats} seats available.`)
            .join('\n');

        const aiInput: CarpoolMatchingInput = {
            location: "User's office location",
            schedule: input.schedule,
            preferences: input.preferences,
            existingRides: ridesString,
        };

        const result = await carpoolMatchingAssistant(aiInput);
        return { success: true, matches: result.suggestedMatches };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to get AI matches." };
    }
}
