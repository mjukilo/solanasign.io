export {};

type PubKeyLike = { toString(): string; toBytes?(): Uint8Array; toBase58?(): string };

interface SolanaLikeProvider {
  isPhantom?: boolean;
  isBackpack?: boolean;
  isGlow?: boolean;
  isExodus?: boolean;
  connect: (opts?: any) => Promise<{ publicKey?: PubKeyLike } | void>;
  disconnect?: () => Promise<void> | void;
  publicKey?: PubKeyLike | null;
  signMessage?: (message: Uint8Array, display?: any) => Promise<Uint8Array | { signature: Uint8Array }>;
}

declare global {
  interface Window {
    solana?: SolanaLikeProvider & Record<string, any>;
    phantom?: { solana?: SolanaLikeProvider };
    solflare?: SolanaLikeProvider & { isConnected?: boolean };
    backpack?: { solana?: SolanaLikeProvider };
    glow?: { solana?: SolanaLikeProvider };
    exodus?: { solana?: SolanaLikeProvider };
  }
}
