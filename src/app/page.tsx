"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from "./page.module.css";
import { getENSNames } from '../utils/ensOwned';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensNames, setEnsNames] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchENSNames = async () => {
      if (walletAddress) {
        try {
          const names = await getENSNames(walletAddress);
          setEnsNames(names.filter((name): name is string => name !== undefined));
        } catch (error) {
          console.error('Error fetching ENS names:', error);
        }
      }
    };

    fetchENSNames();
  }, [walletAddress]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>ENS Loyalty</h1>
        {walletAddress ? (
          <div>
            <p>Connected: {walletAddress}</p>
            <h2>Your ENS Names:</h2>
            {ensNames.length > 0 ? (
              <ul>
                {ensNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
            ) : (
              <p>No ENS names found for this wallet.</p>
            )}
          </div>
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
