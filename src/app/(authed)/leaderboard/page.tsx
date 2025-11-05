import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { leaderboard } from "@/lib/data";
import { Leaf } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
  const getRankBadge = (rank: number) => {
    switch (rank) {
        case 1: return <Badge className="bg-yellow-500 hover:bg-yellow-500/80">Gold</Badge>;
        case 2: return <Badge className="bg-slate-400 hover:bg-slate-400/80">Silver</Badge>;
        case 3: return <Badge className="bg-yellow-700 hover:bg-yellow-700/80">Bronze</Badge>;
        default: return <Badge variant="secondary">{`#${rank}`}</Badge>;
    }
  }
    
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Leaf /> Eco-Friendly Leaderboard</CardTitle>
        <CardDescription>
          See who's leading the way in making our commutes greener.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Rank</TableHead>
                <TableHead>Commuter</TableHead>
                <TableHead className="text-right">Rides Shared</TableHead>
                <TableHead className="text-right">Distance (km)</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {leaderboard.map((entry) => (
                <TableRow key={entry.rank}>
                    <TableCell className="font-medium">{getRankBadge(entry.rank)}</TableCell>
                    <TableCell>
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={entry.user.avatarUrl} alt={entry.user.name} />
                                <AvatarFallback>{entry.user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="grid gap-0.5">
                                <span className="font-medium">{entry.user.name}</span>
                                <span className="text-sm text-muted-foreground">{entry.user.department}</span>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">{entry.ridesShared}</TableCell>
                    <TableCell className="text-right">{entry.distanceCovered.toLocaleString()}</TableCell>
                </TableRow>
                ))}
            </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
