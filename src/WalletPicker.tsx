import React from "react";

export type WalletChoice = "Phantom" | "Solflare" | "Backpack" | "Glow" | "Exodus";

const ITEMS: { name: WalletChoice; icon: string; hint?: string; url?: string }[] = [
  { name: "Phantom", icon: "https://assets.phantom.app/phantom-logo.png" },
  { name: "Solflare", icon: "https://solflare.com/favicon-32x32.png" },
  { name: "Backpack", icon: "https://backpack.app/favicon-32x32.png" },
  { name: "Glow", icon: "https://glow.app/favicon-32x32.png" },
  { name: "Exodus", icon: "https://www.exodus.com/assets/favicon-32x32.png" },
];

export function WalletPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (name: WalletChoice) => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-800 px-5 py-4 text-sm font-semibold">
          Choisir un wallet
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
          {ITEMS.map((w) => (
            <button
              key={w.name}
              onClick={() => onPick(w.name)}
              className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-800/50 px-3 py-3 text-left hover:bg-slate-800 transition"
            >
              <img src={w.icon} alt={w.name} className="h-7 w-7 rounded-md object-cover" />
              <div>
                <div className="text-sm font-medium">{w.name}</div>
                <div className="text-xs text-slate-400">Extension / App mobile</div>
              </div>
            </button>
          ))}
        </div>
        <div className="px-5 pb-4 pt-2 text-xs text-slate-400">
          Astuce mobile : ouvrez cette page dans le navigateur intégré de votre wallet pour autoriser la connexion.
        </div>
      </div>
    </div>
  );
}
