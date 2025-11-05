
"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Loader2 } from "lucide-react";
import { findMatchingRides } from "../ride/actions";
import { useToast } from "@/hooks/use-toast";
import { Ride } from "@/lib/data";

const formSchema = z.object({
    query: z.string().min(10, {
        message: "Your query must be at least 10 characters.",
    }),
});

export default function AiAssistantForm() {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [result, setResult] = useState<Ride[] | null>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            query: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        startTransition(async () => {
            const res = await findMatchingRides(values.query);
            if (res.success) {
                setResult(res.rides);
                toast({
                    title: "Rides Found!",
                    description: "The AI Assistant has found potential matches for you.",
                });
            } else {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive",
                });
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bot /> AI Assistant
                </CardTitle>
                <CardDescription>Use our AI Assistant to find a ride based on your preferences in plain English.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="query"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Your Ride Request</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., 'I need a ride from downtown to the airport next Monday morning around 8 AM'"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Find Match
                        </Button>
                    </form>
                </Form>
                {result && (
                    <div className="mt-6">
                        <h4 className="font-semibold">Matching Rides:</h4>
                        {result.length > 0 ? (
                             <ul className="list-disc pl-5 mt-2 text-sm">
                                {result.map(ride => (
                                    <li key={ride.id}>{ride.startLocation} to {ride.destination}</li>
                                ))}
                            </ul>
                        ): (
                            <p className="text-sm text-muted-foreground mt-2">No rides found matching your criteria.</p>
                        )}
                       
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
