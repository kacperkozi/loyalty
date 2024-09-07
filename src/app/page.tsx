"use client";
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styles from "./page.module.css";
import { getENSNames, ENSInfo as FetchedENSInfo } from '../utils/ensOwned';

// Update the interface to match the one from utils/ensOwned
type ENSInfo = FetchedENSInfo;

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [ensInfo, setEnsInfo] = useState<ENSInfo[]>([]);
  const [selectedName, setSelectedName] = useState<string>('');
  const [customAddress, setCustomAddress] = useState<string>('');
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

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

  const handleNameSelect = (name: string) => {
    setSelectedName(name);
  };

  const handleAddressSelect = async (address: string) => {
    setSelectedAddress(address);
    setError(null);
    try {
      const names = await getENSNames(address);
      setEnsInfo(names);
    } catch (error) {
      console.error('Error fetching ENS names:', error);
      setError('Error fetching ENS names. Please try again.');
    }
  };

  const handleCustomAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (ethers.isAddress(customAddress)) {
      await handleAddressSelect(customAddress);
      setCustomAddress(''); // Clear the input field after submission
    } else {
      setError('Invalid Ethereum address');
    }
  };

  useEffect(() => {
    if (walletAddress) {
      handleAddressSelect(walletAddress);
    }
  }, [walletAddress]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>ENS Loyalty</h1>
        {walletAddress ? (
          <div className={styles.container}>
            <p className={styles.connectedAddress}>Connected: {walletAddress}</p>
            <h2>ENS Names for {selectedAddress === walletAddress ? 'Your Wallet' : 'Selected Address'}:</h2>
            {ensInfo.length > 0 ? (
              <ul className={styles.ensList}>
                {ensInfo.map((info, index) => (
                  <li
                    key={index}
                    onClick={() => handleNameSelect(info.name)}
                    className={`${styles.ensItem} ${selectedName === info.name ? styles.selected : ''}`}
                  >
                    <div>{info.name}</div>
                    <div className={styles.ensDetails}>
                      Registered at timestamp: {info.registrationTimestamp}
                      <br />
                      Owned for: {info.ownershipDuration}
                      <br />
                      Token ID: {info.tokenId}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ENS names found for this address.</p>
            )}
            <h2>Check ENS names for any address:</h2>
            <form onSubmit={handleCustomAddressSubmit} className={styles.form}>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="Enter Ethereum address"
                className={styles.input}
              />
              <button type="submit" className={styles.button}>Check</button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
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
