export type WalletId = "phantom" | "solflare" | "glow" | "exodus" | "backpack";

export type WalletInfo = {
  id: WalletId;
  label: string;
  icon: string;
  detect: () => any | null;
  openInstall: () => void;
};

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const WALLETS: WalletInfo[] = [
  {
    id: "phantom",
    label: "Phantom",
    icon: "https://assets.phantom.app/phantom-logo.png",
    detect: () =>
      (window.phantom?.solana && window.phantom.solana.isPhantom) ||
      (window.solana?.isPhantom ? window.solana : null),
    openInstall: () => window.open(isMobile ? "https://phantom.app/" : "https://phantom.app/download", "_blank"),
  },
  {
    id: "solflare",
    label: "Solflare",
    icon: "https://solflare.com/favicon-32x32.png",
    detect: () => window.solflare ?? null,
    openInstall: () => window.open(isMobile ? "https://solflare.com/" : "https://solflare.com/download", "_blank"),
  },
  {
    id: "glow",
    label: "Glow",
    icon: "https://glow.app/favicon-32x32.png",
    detect: () => {
      const p = (window as any).glow?.solana || window.solana;
      return p && (p.isGlow || (p as any)?.provider === "Glow") ? p : null;
    },
    openInstall: () => window.open("https://glow.app/download", "_blank"),
  },
  {
    id: "exodus",
    label: "Exodus",
    icon: "https://www.exodus.com/assets/favicon-32x32.png",
    detect: () => {
      const p = (window as any).exodus?.solana || window.solana;
      return p && (p.isExodus || (p as any)?.provider === "Exodus") ? p : null;
    },
    openInstall: () => window.open("https://www.exodus.com/download/", "_blank"),
  },
  {
    id: "backpack",
    label: "Backpack",
    icon: "https://backpack.app/favicon-32x32.png",
    detect: () => (window as any).backpack?.solana || (window.solana?.isBackpack ? window.solana : null),
    openInstall: () => window.open("https://backpack.app/download", "_blank"),
  },
];

export async function connectWalletById(
  id: WalletId
): Promise<{ provider: any; publicKey: string } | null> {
  const w = WALLETS.find((x) => x.id === id)!;
  const provider = w.detect();
  if (!provider) {
    w.openInstall();
    return null;
  }
  const resp = await provider.connect?.({ onlyIfTrusted: false });
  const pk = (resp as any)?.publicKey ?? provider.publicKey;
  const publicKey =
    typeof pk?.toBase58 === "function"
      ? pk.toBase58()
      : typeof pk?.toString === "function"
      ? pk.toString()
      : String(pk);
  return { provider, publicKey };
}

export async function disconnectProvider(provider: any) {
  try { await provider?.disconnect?.(); } catch (e) { console.warn("disconnect error:", e); }
}
