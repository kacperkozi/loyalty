import { ethers } from "ethers";
import * as fs from "fs";
import * as dotenv from "dotenv";

dotenv.config();

const contractAddress = "<DEPLOYED_CONTRACT_ADDRESS>"; // Replace with the actual deployed contract address
const abi = JSON.parse(fs.readFileSync("artifacts/contracts/SimpleNFT.sol/SimpleNFT.json", "utf8")).abi;

// Arweave link to the image metadata (ensure you have uploaded metadata containing image URI)
const arweaveMetadataUrl = "https://arweave.net/<ARWEAVE_IMAGE_LINK>";

// Replace with your Optimism Sepolia RPC URL and private key
const provider = new ethers.providers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

async function mintNFT() {
    const contract = new ethers.Contract(contractAddress, abi, wallet);

    try {
        console.log("Minting NFT...");
        const tx = await contract.mintNFT(wallet.address, arweaveMetadataUrl);
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("NFT minted successfully!");
    } catch (error) {
        console.error("Error minting NFT:", error);
    }
}

mintNFT();
