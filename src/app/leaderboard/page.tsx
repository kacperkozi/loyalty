'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LeaderboardEntry {
  rank: number;
  name: string;
  duration: string;
  score: number;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    // Mock data fetching
    const mockData: LeaderboardEntry[] = [
      { rank: 1, name: "kozi.eth", duration: "2 years", score: 1000 },
      { rank: 2, name: "vitalik.eth", duration: "5 years", score: 950 },
      { rank: 3, name: "nick.eth", duration: "4 years", score: 900 },
      { rank: 4, name: "taylor.eth", duration: "3 years", score: 850 },
      { rank: 5, name: "ens.eth", duration: "6 years", score: 800 },
    ];
    setLeaderboardData(mockData);
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>ENS Loyalty Leaderboard</CardTitle>
          <CardDescription>Top performers in ENS name ownership duration</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Current standings in the ENS Loyalty program</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Rank</TableHead>
                <TableHead>ENS Name</TableHead>
                <TableHead>Ownership Duration</TableHead>
                <TableHead className="text-right">Loyalty Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.rank}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.name}</TableCell>
                  <TableCell>{entry.duration}</TableCell>
                  <TableCell className="text-right">{entry.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
