'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

const nftImageUrl = "https://mzgreh7dxqq3s7mix2pfwkco3beetb6upgzxkonr3suk55phikxa.arweave.net/Zk0SH-O8Ibl9iL6eWyhO2EhJh9R5s3U5sdyorvXnQq4"

function CompletePageContent() {
  const searchParams = useSearchParams();
  const txHash = searchParams.get('txHash') || '';

  return (
    <Card className="w-full max-w-md p-6 text-center">
      <div className="flex flex-col items-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h1 className="text-2xl font-bold">Proving Complete</h1>
        <p>Proving of your ENS ownership is complete and an NFT serving as a proof of your long-term ownership has been minted.</p>
        <div className="mt-4">
          <Image src={nftImageUrl} alt="1 Year Ownership NFT" width={200} height={200} className="rounded-lg" />
        </div>
        <div className="mt-2 text-sm text-gray-600">
          <p>Transaction Hash:</p>
          <a href={`https://sepolia-optimism.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="font-mono break-all">{txHash}</a>
        </div>
      </div>
    </Card>
  );
}

export default function CompletePage() {
  return (
    <div className="flex justify-center items-center h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <CompletePageContent />
      </Suspense>
    </div>
  );
}
