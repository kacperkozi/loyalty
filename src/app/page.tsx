'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { getENSNames, ENSInfo as FetchedENSInfo } from '../utils/ensOwned'
import { toast } from "../hooks/use-toast"
import { Separator } from '@/components/ui/separator';
import { Loader2 } from "lucide-react"
import { requestHdpProof } from '../utils/requestHdpProof';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"

import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type ENSInfo = FetchedENSInfo;

const FormSchema = z.object({
  selectedENS: z.string(),
})

export default function Home() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensInfo, setEnsInfo] = useState<ENSInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send('eth_requestAccounts', []);
        setWalletAddress(accounts[0]);
      } catch (error) {
        console.error('User denied account access', error);
      }
    } else {
      alert('MetaMask is not installed. Please install it to use this feature.');
    }
  };

  const handleAddressSelect = async (address: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const names = await getENSNames(address);
      setEnsInfo(names);
    } catch (error) {
      console.error('Error fetching ENS names:', error);
      setError('Error fetching ENS names. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log("onSubmit function called", data);
    const selectedENSInfo = ensInfo.find(info => info.name === data.selectedENS);
    if (selectedENSInfo) {
      setIsLoading(true);
      console.log("Selected ENS Info:", selectedENSInfo);
      try {
        const result = await requestHdpProof(selectedENSInfo);
        if (result.success && result.status === 'PROOF_DONE') {
          router.push('/complete');
        } else {
          console.error('Proof not ready:', result.message);
        }
      } catch (error) {
        console.error('Error requesting HDP proof:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while requesting the HDP proof.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Selected ENS not found in ensInfo:", data.selectedENS, ensInfo);
      toast({
        title: "Error",
        description: "Selected ENS not found. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (walletAddress) {
      handleAddressSelect(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <Card className="w-[350px] px-4">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-center">ENS Loyalty</CardTitle>
            <CardDescription className="text-center text-sm">Check your ENS names and prove how long you&apos;ve owned them.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {walletAddress ? (
              <div>
                <p className="text-xs">Connected: {walletAddress}</p>
                <Separator className="my-2" />
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="selectedENS"
                        render={({ field }) => (
                          <FormItem className="space-y-3">
                            <FormLabel className="text-sm">Select an ENS name</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="flex flex-col space-y-1"
                              >
                                {ensInfo.map((info) => (
                                  <FormItem className="flex items-center space-x-3 space-y-0" key={info.tokenId}>
                                    <FormControl>
                                      <RadioGroupItem value={info.name} />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {info.name}
                                      <FormDescription>
                                        Owned for: {info.ownershipDuration}
                                      </FormDescription>
                                    </FormLabel>
                                  </FormItem>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading || !form.formState.isValid}
                        onClick={() => console.log("Button clicked", form.getValues())}  // Add this line
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Initiating Proof...
                          </>
                        ) : (
                          "Confirm Selection"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </div>
            ) : (
              <Button onClick={connectWallet} className="w-full">Connect Wallet</Button>
            )}
            {error && <p className="text-red-500">{error}</p>}
          </CardContent>
        </Card>
      </div>
      <Separator />
      <div className="text-sm text-gray-500 py-4 flex justify-center items-center">
        <a
          href="https://ethwarsaw.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          An ETHWarsaw Hackathon Production
        </a>
      </div>
    </div>

  )
}