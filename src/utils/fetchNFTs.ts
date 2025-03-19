import { readContract } from "@wagmi/core";
import { config } from "../wagmi/config";
import { contractABI } from "./contractABI";

const CONTRACT_ADDRESS = "0xDB929853F31f9cfccF753A2Cec27c6A37c9D8bFa"; // Your NFT contract address

export const fetchNFTs = async (walletAddress: string) => {
  try {
    const balance = (await readContract(config, {
      address: CONTRACT_ADDRESS,
      abi: contractABI,
      functionName: "balanceOf",
      args: [walletAddress, 10],
    })) as bigint;

    if (balance > 0) {
      const tokenURI = (await readContract(config, {
        address: CONTRACT_ADDRESS,
        abi: contractABI,
        functionName: "uri",
        args: [1],
      })) as string;

      const response = await fetch(tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/"));
      const metadata = await response.json();

      return {
        image: metadata.image.replace("ipfs://", "https://ipfs.io/ipfs/"),
        name: metadata.name,
        description: metadata.description,
      };
    }
  } catch (error) {
    console.error("Error fetching NFTs:", error);
  }
  return null;
};
