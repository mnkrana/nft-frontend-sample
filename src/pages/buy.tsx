import { contractABI } from "../utils/contractABI";
import { useState, useEffect } from "react";
import axios from "axios";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { publicClient } from "../wagmi/config";
import { useRouter } from "next/router";

const CONTRACT_ADDRESS = "0xDB929853F31f9cfccF753A2Cec27c6A37c9D8bFa";
const TOKEN_IDS = Array.from({ length: 37 }, (_, i) => i + 1);

const BuyNFT: NextPage = () => {    
  const address  = "0xB9160721D278482F153ae7eE9DFb037471228810";
  const isConnected = true;

  const [nfts, setNfts] = useState<{ name: string; image: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!address || !isConnected) return;

    const fetchNFTs = async () => {
      let ownedNFTs: { name: string; image: string }[] = [];

      for (const id of TOKEN_IDS) {
        try {
          const balance = await readBalance(id);
          if (balance > 0) {
            const metadata = await fetchMetadata(id);
            if (metadata?.image) {
              ownedNFTs.push({ name: metadata.name, image: metadata.image });
            }
          }
        } catch (error) {
          console.error(`Error reading balance for token ${id}:`, error);
        }
      }
      setNfts(ownedNFTs);
    };

    fetchNFTs();
  }, [address, isConnected]);

  const readBalance = async (tokenId: number) => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "balanceOf",
        args: [address, tokenId],
      });
      return result as bigint;
    } catch (error) {
      console.error(`Error fetching balance for token ${tokenId}:`, error);
      return 0;
    }
  };

  const fetchMetadata = async (tokenId: number) => {
    try {
      const uri = `https://ipfs.io/ipfs/Qmb269DT2JWVq6AyibidEkDQ99CwMHsZTvwYy3AEBrfa11/${tokenId}.json`;
      const response = await axios.get(uri);
      let imageUrl = response.data.image;
      if (imageUrl.startsWith("ipfs://")) {
        imageUrl = imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return { ...response.data, image: imageUrl };
    } catch (error) {
      console.error(`Error fetching metadata for token ${tokenId}:`, error);
      return null;
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>RanaMarketplace</title>
      </Head>

      <main className={styles.main}>
        <ConnectButton />

        <div className={styles.buttonContainer}>        
          <button className={styles.customButton} onClick={() => router.push("/")}>
            See your NFTs
          </button>
        </div>
        
        <p className={styles.description}><br></br>Rana's Art Collection</p>

        {isConnected ? (
          <div className={styles.nftGrid}>
            {nfts.length > 0 ? (
              nfts.map((nft) => (
                <div key={nft.name} className={styles.nftCard}>
                  <img src={nft.image} alt={nft.name} />
                  <p>{nft.name}</p>
                </div>
              ))
            ) : (
              <p>No NFTs owned.</p>
            )}
          </div>
        ) : (
          <p>Connect your wallet to see your NFTs.</p>
        )}
      </main>
    </div>
  );
};

export default BuyNFT;