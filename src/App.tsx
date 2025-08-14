import { useState } from "react";
import bs58 from "bs58";

/** Providers simples via window.* (Phantom, Solflare, Glow, Exodus, Backpack) **/
type WalletId = "phantom" | "solflare" | "glow" | "exodus" | "backpack";

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

function toPubkeyString(pk: any): string | null {
  if (!pk) return null;
  try {
    if (typeof pk.toBase58 === "function") return pk.toBase58();
    if (typeof pk.toString === "function") return pk.toString();
    return String(pk);
  } catch {
    return null;
  }
}

const WALLETS = [
  {
    id: "phantom",
    label: "Phantom",
    icon: "/assets/phantom.png",
    detect: () => {
      const p1 = (window as any).phantom?.solana;
      if (p1?.isPhantom) return p1;
      const p2 = (window as any).solana;
      if (p2?.isPhantom) return p2;
      return null;
    },
    install: () =>
      window.open(
        isMobile ? "https://phantom.app/" : "https://phantom.app/download",
        "_blank"
      ),
  },
  {
    id: "solflare",
    label: "Solflare",
    icon: "/assets/solflare.png",
    detect: () => (window as any).solflare ?? null,
    install: () =>
      window.open(
        isMobile ? "https://solflare.com/" : "https://solflare.com/download",
        "_blank"
      ),
  },
  {
    id: "glow",
    label: "Glow",
    icon: "/assets/glow.png",
    detect: () => {
      const w = window as any;
      if (w.glow?.solana) return w.glow.solana;
      if (w.solana?.isGlow) return w.solana;
      if (w.solana && (w.solana.provider === "Glow" || w.solana.wallet === "Glow"))
        return w.solana;
      return null;
    },
    install: () => window.open("https://glow.app/download", "_blank"),
  },
  {
    id: "exodus",
    label: "Exodus",
    icon: "/assets/exodus.png",
    detect: () => {
      const w = window as any;
      const p = w.exodus?.solana || w.solana;
      return p && (p.isExodus || p?.provider === "Exodus") ? p : null;
    },
    install: () => window.open("https://www.exodus.com/download/", "_blank"),
  },
  {
    id: "backpack",
    label: "Backpack",
    icon: "/assets/backpack.png",
    detect: () => {
      const w = window as any;
      return w.backpack?.solana || (w.solana?.isBackpack ? w.solana : null);
    },
    install: () => window.open("https://backpack.app/download", "_blank"),
  },
];

export default function App() {
  const [provider, setProvider] = useState<any>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [msg, setMsg] = useState(
    "I am proving I own this wallet on " + new Date().toISOString()
  );
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const connected = !!provider && !!pubkey;
  const disabled = !connected || !msg.trim() || busy;

  async function connectWithCompat(p: any) {
    try {
      return await p.connect?.({ onlyIfTrusted: false });
    } catch {
      try {
        return await p.connect?.();
      } catch {
        try {
          return await p.request?.({ method: "connect" });
        } catch {
          throw new Error("connect failed");
        }
      }
    }
  }

  async function pickWallet(id: WalletId) {
    setPickerOpen(false);
    const w = WALLETS.find((x) => x.id === id)!;
    const p = w.detect();
    if (!p) {
      w.install();
      return;
    }
    try {
      const resp = await connectWithCompat(p);
      const pub =
        toPubkeyString(resp?.publicKey) ||
        toPubkeyString(p.publicKey) ||
        (await (async () => {
          await new Promise((r) => setTimeout(r, 0));
          return toPubkeyString(p.publicKey);
        })());

      if (!pub) throw new Error("No publicKey from provider");
      setProvider(p);
      setPubkey(pub);
    } catch (e) {
      console.warn(`${id} connect error`, e);
    }
  }

  async function disconnect() {
    try {
      await provider?.disconnect?.();
    } catch {}
    setProvider(null);
    setPubkey(null);
    setSig(null); // reset signature on disconnect
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
      const res: any = await provider
        .signMessage(encoded, "utf8")
        .catch(() => provider.signMessage(encoded));
      const raw: Uint8Array = res?.signature ?? res;
      setSig(bs58.encode(raw));
    } catch (e) {
      alert("Signature cancelled or failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copySignature() {
    if (sig) {
      await navigator.clipboard.writeText(sig);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* HEADER */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3">
            <img src="/favicon.svg" alt="SolanaSign" className="h-9 w-9" />
            <div>
              <p className="text-lg font-semibold tracking-tight">SolanaSign</p>
              <p className="text-xs text-slate-400 -mt-1">
                Sign a message • Prove ownership
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            {connected && (
              <span className="text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-emerald-300">
                {pubkey?.slice(0, 4)}…{pubkey?.slice(-4)}
              </span>
            )}
            {!connected ? (
              <button
                onClick={() => setPickerOpen(true)}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-sky-500 text-sky-950 hover:bg-sky-400 transition"
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

      {/* MAIN */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-semibold">
                Prove wallet ownership
                <br />
                <span className="text-sky-400">by signing a message</span>.
              </h1>
              <p className="mt-4 text-slate-300/90 leading-relaxed">
                Works with Phantom, Solflare, Backpack, Glow, Exodus and more.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-900/70 backdrop-blur p-6 md:p-8">
              <label className="block text-sm font-medium text-slate-300">
                Message to sign
              </label>
              <textarea
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                rows={5}
                className="mt-2 w-full resize-y rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100"
              />

              <div className="mt-4 flex justify-between">
                <p className="text-xs text-slate-400">
                  Tip: include a timestamp & domain to avoid replay.
                </p>
                <button
                  onClick={sign}
                  disabled={disabled}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                    disabled
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-sky-500 text-sky-950 hover:bg-sky-400"
                  }`}
                >
                  {busy ? "Signing…" : "Sign message"}
                </button>
              </div>

              {sig && (
                <div
                  onClick={copySignature}
                  className="mt-6 relative cursor-pointer group"
                >
                  <label className="block text-sm font-medium text-slate-300">
                    Signature (bs58)
                  </label>
                  <div className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs break-all relative">
                    {sig}
                    <div className="absolute bottom-2 right-3 text-slate-400 opacity-70 group-hover:opacity-100 transition">
                      📋
                    </div>
                    {copied && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-emerald-400 text-sm font-medium rounded-xl animate-fade">
                        Copied!
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Tip: click anywhere in the box to copy.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 flex justify-between">
          <span>© {new Date().getFullYear()} SolanaSign</span>
          <a
            className="hover:text-slate-200"
            href="https://github.com/mjukilo/solanasign.io"
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* MODAL PICKER */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setPickerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative mx-auto mt-24 w-[92%] max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-slate-800 pb-3 mb-3 text-sm font-semibold">
              Choose a wallet
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {WALLETS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => pickWallet(w.id)}
                  className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 hover:bg-slate-700 transition"
                >
                  <img src={w.icon} alt={w.label} className="h-7 w-7 rounded-md" />
                  <div>
                    <div className="text-sm font-medium">{w.label}</div>
                    <div className="text-xs text-slate-400">
                      Extension / Mobile app
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="pt-3 text-xs text-slate-400">
              Mobile tip: open this page inside your wallet’s in-app browser.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
