import { useRef, useState, useEffect } from "react";
import bs58 from "bs58";
import { WALLETS, WalletId, connectWalletById, disconnectProvider } from "./wallets";

/* Icônes inline */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>;
}
function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M16 4h-1a2 2 0 0 0-4 0H10a2 2 0 0 0-2 2v1H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2zm-3 0a1 1 0 0 1 1 1v1h-2V5a1 1 0 0 1 1-1z"/></svg>;
}
function ExternalIcon(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>;
}
function LogoMark(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M4 7h16l-2 4H6l-2-4zm2 6h12l-2 4H8l-2-4z"/></svg>;
}

/* UI utils */
function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      aria-label="Copy signature to clipboard"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        setTimeout(() => setOk(false), 1200);
      }}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm hover:bg-slate-800 transition"
      title="Copy to clipboard"
    >
      <ClipboardIcon className="h-4 w-4" />
      {ok ? "Copied!" : "Copy"}
    </button>
  );
}
function MobileActionBar({ disabled, onSign }: { disabled: boolean; onSign: () => void }) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800/70 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx
