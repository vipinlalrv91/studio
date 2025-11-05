'use server';
/**
 * @fileOverview AI-powered carpool matching assistant.
 *
 * - carpoolMatchingAssistant - A function that suggests carpool matches based on user location, schedule, and preferences.
 * - CarpoolMatchingInput - The input type for the carpoolMatchingAssistant function.
 * - CarpoolMatchingOutput - The return type for the carpoolMatchingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CarpoolMatchingInputSchema = z.object({
  location: z.string().describe('The current location of the user.'),
  schedule: z.string().describe('The user\u2019s schedule, including days and times available for carpooling.'),
  preferences: z.string().describe('The user\u2019s preferences for carpooling, such as preferred gender, age range, or smoker/non-smoker.'),
  existingRides: z.string().describe('A list of existing carpool rides, including their routes, times, and available seats.'),
});
export type CarpoolMatchingInput = z.infer<typeof CarpoolMatchingInputSchema>;

const CarpoolMatchingOutputSchema = z.object({
  suggestedMatches: z.array(z.string()).describe('A list of suggested carpool matches based on the user\u2019s location, schedule, and preferences.'),
});
export type CarpoolMatchingOutput = z.infer<typeof CarpoolMatchingOutputSchema>;

export async function carpoolMatchingAssistant(input: CarpoolMatchingInput): Promise<CarpoolMatchingOutput> {
  return carpoolMatchingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'carpoolMatchingPrompt',
  input: {schema: CarpoolMatchingInputSchema},
  output: {schema: CarpoolMatchingOutputSchema},
  prompt: `You are a carpool matching assistant. Your goal is to suggest carpool matches for the user based on their location, schedule, and preferences.

Here is the user's information:
Location: {{{location}}}
Schedule: {{{schedule}}}
Preferences: {{{preferences}}}

Here is a list of existing carpool rides:
{{{existingRides}}}

Based on this information, suggest carpool matches for the user. Return a JSON array of strings describing the suggested matches.
`,
});

const carpoolMatchingFlow = ai.defineFlow(
  {
    name: 'carpoolMatchingFlow',
    inputSchema: CarpoolMatchingInputSchema,
    outputSchema: CarpoolMatchingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
