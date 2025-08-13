import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { clusterApiUrl } from "@solana/web3.js";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
} from "@solana/wallet-adapter-phantom";
import {
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-solflare";

// Styles du Wallet Adapter (modal + boutons)
import "@solana/wallet-adapter-react-ui/styles.css";

// Utilise mainnet, ou remplace par ton RPC custom (plus stable/rapide)
const endpoint = clusterApiUrl("mainnet-beta");

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
  // Tu peux ajouter d’autres wallets ici (Backpack, Glow, etc.)
];

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <App />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
