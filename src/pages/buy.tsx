import { contractABI, marketContractABI } from "../utils/contractABI";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import axios from "axios";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { publicClient, walletClient } from "../wagmi/config";
import { useRouter } from "next/router";

const CONTRACT_ADDRESS = "0xDB929853F31f9cfccF753A2Cec27c6A37c9D8bFa";
const MARKET_CONTRACT_ADDRESS = "0x25e3E139F9b6f52b91023566c981b007E2446518";
const TOKEN_IDS = Array.from({ length: 37 }, (_, i) => i + 1);

const BuyNFT: NextPage = () => {
  const mainAddress = "0xB9160721D278482F153ae7eE9DFb037471228810";
  const { address, isConnected } = useAccount();
  const [loading, setLoading] = useState(true);

  const [nfts, setNfts] = useState<{ id: number; name: string; image: string }[]>([]);
  const router = useRouter();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!address || !isConnected) return;

    const fetchNFTs = async () => {
      setLoading(true);
      let ownedNFTs: { id: number; name: string; image: string }[] = [];

      for (const id of TOKEN_IDS) {
        try {
          const balance = await readBalance(id);
          if (balance > 0) {
            const metadata = await fetchMetadata(id);
            if (metadata?.image) {
              ownedNFTs.push({ id, name: metadata.name, image: metadata.image });
            }
          }
        } catch (error) {
          console.error(`Error reading balance for token ${id}:`, error);
        }
      }
      setNfts(ownedNFTs);
      setLoading(false);
    };

    fetchNFTs();
  }, [mainAddress, isConnected]);

  const readBalance = async (tokenId: number) => {
    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "balanceOf",
        args: [mainAddress, tokenId],
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

  const buyNFT = async (tokenId: number) => {
    if (!address || !walletClient) {
      console.error("No connected wallet found!");
      alert("Please connect your wallet first!");
      return;
    }

    try {
      const price = await publicClient.readContract({
        address: MARKET_CONTRACT_ADDRESS,
        abi: marketContractABI,
        functionName: "nftPrice",
      });

      const tx = await walletClient.writeContract({
        address: MARKET_CONTRACT_ADDRESS,
        abi: marketContractABI,
        functionName: "purchase",
        args: [tokenId],
        account: address,
        value: price as bigint,
      });

      console.log("Transaction sent:", tx);
      alert(`NFT #${tokenId} purchase successful!`);
    } catch (error) {
      console.error(`Error purchasing NFT #${tokenId}:`, error);
      alert(`Purchase failed: ${(error as Error).message}`);
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

        <p className={styles.description}>
          <br></br>Rana's Art Collection
        </p>

        {isConnected ? (
          <div className={styles.nftGrid}>
            {loading ? (
              <div className={styles.loader}></div>
            ) : nfts.length > 0 ? (
              <div className={styles.nftGrid}>
                {nfts.map((nft) => (
                  <div key={nft.name} className={styles.nftCard}>
                    <img src={nft.image} alt={nft.name} />
                    <p>{nft.name}</p>
                    <button className={styles.buyButton} onClick={() => buyNFT(nft.id)}>
                      Buy NFT
                    </button>
                  </div>
                ))}
              </div>
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
