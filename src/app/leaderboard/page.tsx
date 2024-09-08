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
  id: number;
  domain_name: string;
  status: string;
  updatedAt: string;
  nft_mint_transaction_hash: string | null;
}

export default function LeaderboardPage() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/get_all_requests`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchLeaderboardData();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>ENS Loyalty Leaderboard</CardTitle>
          <CardDescription>Current standings in the ENS Loyalty program</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>ENS Loyalty Leaderboard</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Domain Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>NFT Transaction</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.domain_name}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                  <TableCell>{new Date(entry.updatedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    {entry.nft_mint_transaction_hash ? (
                      <a
                        href={`https://sepolia-optimism.etherscan.io/tx/${entry.nft_mint_transaction_hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View Transaction
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
