
"use client";

import Link from "next/link";
import { Bell, Car, Home, LogOut, Search, Settings, User, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useUser } from "@/hooks/use-user";
import { Logo } from "@/components/logo";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AuthedLayout({ children }: { children: React.ReactNode }) {
  const { user: mockUser } = useUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab');

  if (!mockUser) return null; // Or a loading state

  const navItems = [
    { href: "/dashboard", icon: Home, label: "Dashboard", tab: null },
    { href: "/dashboard?tab=find-ride", icon: Search, label: "Find Ride", tab: "find-ride" },
    { href: "/dashboard?tab=offer-ride", icon: Car, label: "Offer Ride", tab: "offer-ride" },
    { href: "/dashboard?tab=notifications", icon: Bell, label: "Notifications", tab: "notifications" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Logo className="h-6 w-6" />
              <span className="">CarpoolConnect</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    (pathname === '/dashboard' && currentTab === item.tab) && "text-primary bg-muted"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Upgrade to Pro</CardTitle>
                <CardDescription>
                  Unlock all features and get unlimited access to our support team.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">Upgrade</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
           <Sheet>
            <SheetTrigger asChild>
                <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
                >
                <Car className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                    <Logo className="h-6 w-6" />
                    <span className="">CarpoolConnect</span>
                </Link>
                {navItems.map((item) => (
                    <Link
                    key={item.label}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",
                         (pathname === '/dashboard' && currentTab === item.tab) && "bg-muted text-foreground"
                    )}
                    >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                    </Link>
                ))}
                </nav>
                <div className="mt-auto">
                <Card>
                    <CardHeader>
                    <CardTitle>Upgrade to Pro</CardTitle>
                    <CardDescription>
                        Unlock all features and get unlimited access to our support
                        team.
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <Button size="sm" className="w-full">
                        Upgrade
                    </Button>
                    </CardContent>
                </Card>
                </div>
            </SheetContent>
            </Sheet>

          <div className="w-full flex-1">
            {/* Search can go here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                    <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} />
                    <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</D