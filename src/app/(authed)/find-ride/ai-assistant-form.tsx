"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { getAiMatches } from "./actions";

export default function AiAssistantForm() {
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setMatches([]);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const schedule = formData.get("schedule") as string;
        const preferences = formData.get("preferences") as string;

        const result = await getAiMatches({ schedule, preferences });

        if (result.success && result.matches) {
            setMatches(result.matches);
        } else {
            setError(result.error || "An unknown error occurred.");
        }
        setLoading(false);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Wand2 className="h-6 w-6 text-accent" />
                        <CardTitle>AI Matching Assistant</CardTitle>
                    </div>
                    <CardDescription>Let AI find the best ride for you based on your needs.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="schedule">Your Schedule</Label>
                        <Textarea 
                            id="schedule" 
                            name="schedule"
                            placeholder="e.g., Mon-Fri, 8 AM to office, 5 PM from office" 
                            defaultValue="Monday to Friday, need a ride to the office around 8:30 AM and back home around 5:30 PM."
                        />
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="preferences">Preferences</Label>
                        <Textarea 
                            id="preferences" 
                            name="preferences"
                            placeholder="e.g., Non-smoker, similar music taste, etc." 
                            defaultValue="I prefer a non-smoking car and enjoy listening to podcasts."
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Find My Match
                    </Button>
                </CardFooter>
            </form>
            {(matches.length > 0 || error) && (
                <CardContent>
                    <h3 className="font-semibold mb-2">Suggested Matches:</h3>
                    {error && <p className="text-destructive text-sm">{error}</p>}
                    {matches.length > 0 && (
                        <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                            {matches.map((match, index) => (
                                <li key={index}>{match}</li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            )}
        </Card>
    );
}
