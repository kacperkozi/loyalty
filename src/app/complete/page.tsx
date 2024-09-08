import { Card } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Image from "next/image"

const nftImageUrl = "https://mzgreh7dxqq3s7mix2pfwkco3beetb6upgzxkonr3suk55phikxa.arweave.net/Zk0SH-O8Ibl9iL6eWyhO2EhJh9R5s3U5sdyorvXnQq4"
const txHash = "0x2c3e...ab5d"

export default function CompletePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
          <h1 className="text-2xl font-bold">Proving Complete</h1>
          <p> Proving of your ENS ownership is complete and an NFT serving as a proof of your long-term ownership has been minted.</p>
          {/* NFT Image */}
          <div className="mt-4">
            <Image src={nftImageUrl} alt="1 Year Ownership NFT" width={200} height={200} className="rounded-lg" />
          </div>
          
          {/* Transaction Hash */}
          <div className="mt-2 text-sm text-gray-600">
            <p>Transaction Hash:</p>
            <a href={`https://sepolia-optimism.etherscan.io/tx/${txHash}`} className="font-mono break-all">{txHash}</a>
          </div>
        </div>
      </Card>
    </div>
  )
}
