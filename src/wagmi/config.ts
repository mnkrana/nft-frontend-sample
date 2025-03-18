import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {  
} from "wagmi/chains";

import { puppynet } from "./chains";

export const config = getDefaultConfig({
  appName: "RanaMarketplace",
  projectId: "YOUR_PROJECT_ID",
  chains: [    
    puppynet,  
  ],
  ssr: true,
});
