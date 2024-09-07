"use client";
import Image from "next/image";
import styles from "./page.module.css";
import { useState } from 'react';
import { ethers } from 'ethers';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // Request accounts from the wallet
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

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>ENS Loyalty</h1>
        {walletAddress ? (
          <p>Connected: {walletAddress}</p>
        ) : (
          <button className={styles.walletButton} onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </main>
      <footer className={styles.footer}>
        <a
          href="https://ethwarsaw.dev"
          target="_blank"
          rel="noopener noreferrer"
        >
          An ETHWarsaw Hackathon Project
        </a>
      </footer>
    </div>
  );
}
