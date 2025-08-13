import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function Header() {
  return (
    <header className="w-full">
      <div className="mx-auto max-w-[1200px] px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-accent/20 grid place-items-center">
            <span className="text-accent font-bold">◎</span>
          </div>
          <div className="flex flex-col leading-5">
            <span className="font-semibold">SolanaSign</span>
            <span className="text-xs text-muted">Sign a message • Prove ownership</span>
          </div>
        </div>
        <WalletMultiButton className="!bg-accent !text-white !rounded-full !px-5 !py-2.5 !h-auto !shadow" />
      </div>
    </header>
  );
}
