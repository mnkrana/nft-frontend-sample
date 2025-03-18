import { defineChain } from "viem";

export const puppynet = defineChain({
  id: 157,
  name: "Shibarium Puppynet",
  network: "shibarium-puppynet",
  nativeCurrency: {
    decimals: 18,
    name: "Bone",
    symbol: "BONE",
  },
  rpcUrls: {
    default: { http: ["https://puppynet.shibrpc.com"] },
    public: { http: ["https://puppynet.shibrpc.com"] },
  },
  blockExplorers: {
    default: { name: "ShibariumScan", url: "https://puppyscan.shib.io" },
  },
});
