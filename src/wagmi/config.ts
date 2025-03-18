import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { createPublicClient, http } from "viem";
import { puppynet } from "./chains";

export const config = getDefaultConfig({
  appName: "RanaMarketplace",
  projectId: "YOUR_PROJECT_ID",
  chains: [puppynet],
  ssr: true,
});

// Create a public client for contract reads
export const publicClient = createPublicClient({
  chain: puppynet,
  transport: http(),
});
