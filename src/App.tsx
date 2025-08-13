import { useState } from "react";
import bs58 from "bs58";

/** Providers simples via window.* (Phantom, Solflare, Glow, Exodus, Backpack) **/
type WalletId = "phantom" | "solflare" | "glow" | "exodus" | "backpack";

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const WALLETS: { id: WalletId; label: string; icon: string; detect: () => any | null; install: () => void }[] = [
  {
    id: "phantom",
    label: "Phantom",
    icon: "https://assets.phantom.app/phantom-logo.png",
    detect: () =>
      (window.phantom?.solana && window.phantom.solana.isPhantom) ||
      (window.solana?.isPhantom ? window.solana : null),
    install: () => window.open(isMobile ? "https://phantom.app/" : "https://phantom.app/download", "_blank"),
  },
  {
    id: "solflare",
    label: "Solflare",
    icon: "https://solflare.com/favicon-32x32.png",
    detect: () => (window as any).solflare ?? null,
    install: () => window.open(isMobile ? "https://solflare.com/" : "https://solflare.com/download", "_blank"),
  },
  {
    id: "glow",
    label: "Glow",
    icon: "https://glow.app/favicon-32x32.png",
    detect: () => {
      const p = (window as any).glow?.solana || (window as any).solana;
      return p && (p.isGlow || p?.provider === "Glow") ? p : null;
    },
    install: () => window.open("https://glow.app/download", "_blank"),
  },
  {
    id: "exodus",
    label: "Exodus",
    icon: "https://www.exodus.com/assets/favicon-32x32.png",
    detect: () => {
      const p = (window as any).exodus?.solana || (window as any).solana;
      return p && (p.isExodus || p?.provider === "Exodus") ? p : null;
    },
    install: () => window.open("https://www.exodus.com/download/", "_blank"),
  },
  {
    id: "backpack",
    label: "Backpack",
    icon: "https://backpack.app/favicon-32x32.png",
    detect: () => (window as any).backpack?.solana || ((window as any).solana?.isBackpack ? (window as any).solana : null),
    install: () => window.open("https://backpack.app/download", "_blank"),
  },
];

export default function App() {
  const [provider, setProvider] = useState<any>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [msg, setMsg] = useState("I am proving I own this wallet on " + new Date().toISOString());
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const connected = !!provider && !!pubkey;
  const disabled = !connected || !msg.trim() || busy;

  async function pickWallet(id: WalletId) {
    setPickerOpen(false);
    const w = WALLETS.find((x) => x.id === id)!;
    const p = w.detect();
    if (!p) {
      w.install();
      return;
    }
    try {
      const resp = await p.connect?.({ onlyIfTrusted: false });
      const pk = resp?.publicKey ?? p.publicKey;
      const pub =
        typeof pk?.toBase58 === "function" ? pk.toBase58()
        : typeof pk?.toString === "function" ? pk.toString()
        : String(pk);
      setProvider(p);
      setPubkey(pub);
    } catch {
      // cancel/deny
    }
  }

  async function disconnect() {
    try { await provider?.disconnect?.(); } catch {}
    setProvider(null);
    setPubkey(null);
  }

  async function sign() {
    if (!connected) {
      setPickerOpen(true);
      return;
    }
    if (!provider?.signMessage) {
      alert("This wallet does not support signMessage.");
      return;
    }
    setBusy(true);
    setSig(null);
    try {
      const encoded = new TextEncoder().encode(msg);
      const res: any = await provider.signMessage(encoded, "utf8").catch(() => provider.signMessage(encoded));
      const raw: Uint8Array = res?.signature ?? res;
      setSig(bs58.encode(raw));
    } catch (e) {
      console.error(e);
      alert("Signature cancelled or failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ===== BACKGROUND ===== 
           - motif grid
           - dégradé RADIAL positionné VERS le bouton (top-right / 90% 0)
      */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid bg-[length:22px_22px]" />
        <div className="absolute inset-0 bg-[radial-gradient(70rem_60rem_at_90%_0%,rgba(14,165,233,.22),transparent_60%)]" />
      </div>

      {/* ===== HEADER ===== */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-6 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="SolanaSign" className="h-9 w-9 rounded-xl ring-1 ring-sky-400/30" />
            <div>
              <p className="text-lg font-semibold tracking-tight">SolanaSign</p>
              <p className="text-xs text-slate-400 -mt-1">Sign a message • Prove ownership</p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            {connected && (
              <span className="text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-emerald-300">
                {pubkey?.slice(0,4)}…{pubkey?.slice(-4)}
              </span>
            )}
            {!connected ? (
              <button
                onClick={() => setPickerOpen(true)}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-sky-500 text-sky-950 hover:bg-sky-400 transition shadow-glow"
              >
                Connect wallet
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-slate-700 text-slate-200 hover:bg-slate-600 transition"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ===== HERO + CARD ===== */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Texte à gauche */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Prove wallet ownership<br/><span className="text-sky-400">by signing a message</span>.
              </h1>
              <p className="mt-4 text-slate-300/90 leading-relaxed">
                Works with Phantom, Solflare, Backpack, Glow, Exodus and more.
                No passwords, no email—just cryptographic proof.
              </p>
              <ul className="mt-6 space-y-2 text-slate-300/80 text-sm">
                <li className="flex items-center gap-2">
                  <span className="i-lucide-check h-4 w-4 text-emerald-400" /> Non-custodial • stays in your wallet
                </li>
                <li className="flex items-center gap-2">
                  <span className="i-lucide-check h-4 w-4 text-emerald-400" /> bs58 signature output
                </li>
                <li className="flex items-center gap-2">
                  <span className="i-lucide-check h-4 w-4 text-emerald-400" /> Copy & share instantly
                </li>
              </ul>
            </div>

            {/* Carte de signature */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 backdrop-blur p-6 md:p-8 shadow-glow">
              <label className="block text-sm font-medium text-slate-300">Message to sign</label>
              <textarea
                value={msg}
                onChange={(e)=>setMsg(e.target.value)}
                rows={5}
                placeholder="Write the exact message you want to sign"
                className="mt-2 w-full resize-y rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand.ring"
              />

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-400">Tip: include a timestamp & domain to avoid replay.</p>
                <button
                  onClick={sign}
                  disabled={disabled}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition shadow-glow ${disabled ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-sky-500 text-sky-950 hover:bg-sky-400"}`}
                >
                  {busy ? "Signing…" : "Sign message"}
                </button>
              </div>

              {sig && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300">Signature (bs58)</label>
                  <div className="mt-2 rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 text-xs break-all">
                    {sig}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      onClick={async () => { if (sig) await navigator.clipboard.writeText(sig); }}
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm hover:bg-slate-800 transition"
                      title="Copy to clipboard"
                    >
                      <span className="i-lucide-clipboard h-4 w-4" />
                      Copy
                    </button>
                    {pubkey && (
                      <a
                        href={`https://explorer.solana.com/address/${pubkey}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 text-sm underline decoration-dotted hover:opacity-90"
                      >
                        <span className="i-lucide-external-link h-4 w-4" /> View wallet on Explorer
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} SolanaSign</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-slate-200" href="https://github.com/mjukilo/solanasign.io">GitHub</a>
            <button
              onClick={()=>document.documentElement.classList.toggle('dark')}
              className="rounded-xl border border-slate-700/60 px-3 py-1"
              title="Toggle dark mode"
            >
              Toggle theme
            </button>
          </div>
        </div>
      </footer>

      {/* ===== MODAL PICKER (overlay) ===== */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setPickerOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-800 px-5 py-4 text-sm font-semibold">Choose a wallet</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => pickWallet(w.id)}
                  className="flex items-center gap-3 rounded-xl border border-slate-700/70 bg-slate-800/50 px-3 py-3 text-left hover:bg-slate-800 transition"
                >
                  <img src={w.icon} alt={w.label} className="h-7 w-7 rounded-md object-cover" />
                  <div>
                    <div className="text-sm font-medium">{w.label}</div>
                    <div className="text-xs text-slate-400">Extension / Mobile app</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-5 pb-4 pt-2 text-xs text-slate-400">
              Mobile tip: open this page inside your wallet’s in-app browser.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
