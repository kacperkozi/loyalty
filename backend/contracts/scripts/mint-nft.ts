import { ethers } from "ethers";
//import * as dotenv from "dotenv";

import { env } from "bun";

// Load environment variables
//dotenv.config();

// Optimism Sepolia provider
const provider = new ethers.JsonRpcProvider(env.SEPOLIA_RPC_URL);

// Wallet private key
const wallet = new ethers.Wallet(env.PRIVATE_KEY as string, provider);

// Replace this with your deployed contract's address
const contractAddress = "0x7CB06E40Fc082dc68495bDfbF76549d6286213e1";

// Replace this with your contract's ABI
const abi = [
    "function mintNFT(address recipient, string memory metadataURI) public returns (uint256)"
];

// Arweave link to the metadata (JSON containing image URL, etc.)
//const arweaveMetadataUrl = "https://arweave.net/<ARWEAVE_IMAGE_LINK>";

const arweaveMetadataUrls = [
    "https://mzgreh7dxqq3s7mix2pfwkco3beetb6upgzxkonr3suk55phikxa.arweave.net/Zk0SH-O8Ibl9iL6eWyhO2EhJh9R5s3U5sdyorvXnQq4",
    "https://coawqjyon7pg2ca4ke3eqzzmzbh6x5rqryv7kt3qoo4uezuo62qa.arweave.net/E4FoJw5v3m0IHFE2SGcsyE_r9jCOK_VPcHO5QmaO9qA",
    "https://jojc3may74mxr466dtfykjue4czhpdl47iznn7r2a22f75dmciqa.arweave.net/S5ItsBj_GXjz3hzLhSaE4LJ3jXz6Mtb-Oga0X_RsEiA",
    "https://ppbgf3tjibcsfjlwza5h3wgmdwsgvg7c6npwodvrc4mvuhnifjjq.arweave.net/e8Ji7mlARSKldsg6fdjMHaRqm-LzX2cOsRcZWh2oKlM",
    "https://iu7bmr4dw3tue5rieutmcwcjjyzjv4ztlnzibd4zqsos32lvbt5q.arweave.net/RT4WR4O250J2KCUmwVhJTjKa8zNbcoCPmYSdLel1DPs",
  
];

export async function mintNFT(loyalYears: number) {
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    try {
        console.log("Minting NFT with metadata URI:", arweaveMetadataUrls[loyalYears-1]);

        console.log("Wallet address:", wallet.address);
        // Call the mintNFT function of your contract
        const tx = await contract.mintNFT(wallet.address, arweaveMetadataUrls[loyalYears-1]);
        console.log("Transaction hash:", tx.hash);

        // Wait for the transaction to be mined
        await tx.wait();

        console.log("NFT minted successfully!");
        return tx.hash;
    } catch (error) {
        console.error("Error minting NFT:", error);
    }
}


