import { ethers } from "hardhat";

async function main() {
    const SimpleNFT = await ethers.getContractFactory("SimpleNFT");
    const simpleNFT = await SimpleNFT.deploy();

    await simpleNFT.deployed();

    console.log("SimpleNFT deployed to:", simpleNFT.address);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
