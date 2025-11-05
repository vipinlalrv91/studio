"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/logo";
import Image from "next/image";
import { placeholderImages } from "@/lib/placeholder-images.json";
import { users } from "@/lib/data";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useUser } from "@/hooks/use-user";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();
  const heroImage = placeholderImages.find(p => p.id === "login-hero");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      const user = users.find(u => u.id === selectedUserId);
      if (user) {
        setUser(user);
        router.push("/dashboard");
      }
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
              <Logo className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold font-headline">CarpoolConnect</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Select a user to log in and connect with your colleagues.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                This is a demo. Please select a user to continue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                   <Select onValueChange={setSelectedUserId} value={selectedUserId || ""}>
                      <SelectTrigger>
                          <SelectValue placeholder="Select a user to login" />
                      </SelectTrigger>
                      <SelectContent>
                          {users.map(user => (
                              <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.department})
                              </SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={!selectedUserId}>
                  Login
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {heroImage && (
            <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                width={1280}
                height={800}
                className="h-full w-full object-cover dark:brightness-[0.3]"
                data-ai-hint={heroImage.imageHint}
            />
        )}
      </div>
    </div>
  );
}
