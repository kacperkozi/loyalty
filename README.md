# ENS Loyalty

This project demonstrates an MVP system for proving continuous ownership of Ethereum Name Service (ENS) domains. It allows users to cryptographically verify how long they've owned their ENS names and mint an NFT as a proof of ownership for the duration of their ownership.

How It Works
1. Wallet Connection: Users connect their Ethereum wallet to the application.

2. ENS Name Retrieval: The system fetches all ENS names owned by the connected wallet address.

3. Ownership Duration Calculation: For each ENS name, the application calculates the duration of ownership by analyzing historical onchain data.

4. HDP (Herodotus Data Processor) Proof: The system initiates a proof generation process using HDP to cryptographically verify the continuous ownership of the ENS name.

5. Loyalty Verification: Once the proof is generated, users can demonstrate their long-term commitment to their ENS names thanks to the minted NFT showcasing the duration of ownership.

## Tech Stack

- Next.js
- Tailwind CSS
- Solidity
- Ethereum
- HDP

This is an ETHWarsaw 2024 hackathon project.