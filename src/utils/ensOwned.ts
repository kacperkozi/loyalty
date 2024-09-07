import { Alchemy, Network, AssetTransfersCategory, SortingOrder } from 'alchemy-sdk'

const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const sepoliaAlchemy = new Alchemy({ apiKey, network: Network.ETH_SEPOLIA });

export interface ENSInfo {
    name: string;
    registrationTimestamp: number;
    ownershipDuration: string;
    tokenId: string; // Add this line
}

async function getENSInfo(tokenId: string, nft: any): Promise<ENSInfo> {
    try {
        const response = await fetch(`https://metadata.ens.domains/sepolia/0x0635513f179D50A207757E05759CbD106d7dFcE8/${tokenId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch ENS metadata');
        }
        const data = await response.json();
        const name = data.name || `Unknown (TokenID: ${tokenId})`;
        console.log('NFT data:', nft);
        const registrationTimestamp = await findRegistrationTimestamp(tokenId);
        console.log('Registration timestamp:', registrationTimestamp);
        const ownershipDuration = await calculateOwnershipDuration(registrationTimestamp);
        return { name, registrationTimestamp, ownershipDuration, tokenId };
    } catch (error) {
        console.error('Error fetching ENS info:', error);
        return { name: `Unknown (TokenID: ${tokenId})`, registrationTimestamp: 0, ownershipDuration: 'Unknown', tokenId };
    }
}

async function findRegistrationTimestamp(tokenId: string): Promise<number> {
    const ensContractAddress = '0x0635513f179D50A207757E05759CbD106d7dFcE8';
    const registrationMethodId = '0x0ff2120a'; // Keccak-256 hash of "register(string,address,uint256,bytes32,address,bytes[])" signature

    try {
        const res = await sepoliaAlchemy.core.getAssetTransfers({
            fromBlock: "0x0",
            toBlock: "latest",
            contractAddresses: [ensContractAddress],
            category: [AssetTransfersCategory.ERC721],
            excludeZeroValue: false,
            withMetadata: true,
            order: SortingOrder.ASCENDING,
        });

        for (const transfer of res.transfers) {
            if (transfer.tokenId === tokenId && transfer.from === "0x0000000000000000000000000000000000000000") {
                // This is the minting transaction for our token
                const txReceipt = await sepoliaAlchemy.core.getTransactionReceipt(transfer.hash);
                if (txReceipt && txReceipt.logs) {
                    for (const log of txReceipt.logs) {
                        if (log.topics[0].startsWith(registrationMethodId)) {
                            // We found the registration event
                            const block = await sepoliaAlchemy.core.getBlock(txReceipt.blockNumber);
                            return block.timestamp;
                        }
                    }
                }
            }
        }
        return 0; // Return 0 if we couldn't find the registration event
    } catch (error) {
        console.error('Error finding registration timestamp:', error);
        return 0;
    }
}

async function calculateOwnershipDuration(registrationBlock: number): Promise<string> {
    if (registrationBlock === 0) return 'Unknown';

    const latestBlock = await sepoliaAlchemy.core.getBlock('latest');
    if (!latestBlock) return 'Unknown';

    const blockDifference = latestBlock.number - registrationBlock;
    const secondsDifference = blockDifference * 12; // Assuming 12 seconds per block on Sepolia
    const days = Math.floor(secondsDifference / (24 * 60 * 60));

    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    const remainingDays = days % 30;

    let result = '';
    if (years > 0) {
        result += `${years} year${years > 1 ? 's' : ''}`;
        if (months > 0 || remainingDays > 0) result += ', ';
    }
    if (months > 0) {
        result += `${months} month${months > 1 ? 's' : ''}`;
        if (remainingDays > 0) result += ', ';
    }
    if (remainingDays > 0 || (years === 0 && months === 0)) {
        result += `${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }

    return result;
}

export async function getENSNames(walletAddress: string): Promise<ENSInfo[]> {
    const ensContractAddress = '0x0635513f179D50A207757E05759CbD106d7dFcE8'

    try {
        const sepoliaNfts = await sepoliaAlchemy.nft.getNftsForOwner(walletAddress, { contractAddresses: [ensContractAddress] });

        const ensInfoPromises = sepoliaNfts.ownedNfts.map(nft => getENSInfo(nft.tokenId, nft));
        return await Promise.all(ensInfoPromises);
    } catch (error) {
        console.error('Error fetching ENS names:', error);
        return [];
    }
}