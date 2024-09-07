import { Alchemy, Network } from 'alchemy-sdk'

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const mainnetAlchemy = new Alchemy({ apiKey, network: Network.ETH_MAINNET });
const sepoliaAlchemy = new Alchemy({ apiKey, network: Network.ETH_SEPOLIA });

export async function getENSNames(walletAddress: string) {
  const ensContractAddress = '0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85'
  
  const [mainnetNfts, sepoliaNfts] = await Promise.all([
    mainnetAlchemy.nft.getNftsForOwner(walletAddress, { contractAddresses: [ensContractAddress] }),
    sepoliaAlchemy.nft.getNftsForOwner(walletAddress, { contractAddresses: [ensContractAddress] })
  ]);

  return [...mainnetNfts.ownedNfts, ...sepoliaNfts.ownedNfts].map(nft => nft.name);
}