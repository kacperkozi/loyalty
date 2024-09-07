import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>ENS Loyalty</h1>
        <button className={styles.walletButton}>Connect Wallet</button>
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
