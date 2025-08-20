import { useState } from "react";
import bs58 from "bs58";

// Icons
import phantomIcon from "./assets/phantom.svg";
import solflareIcon from "./assets/solflare.svg";
import glowIcon from "./assets/glow.svg";
import exodusIcon from "./assets/exodus.svg";
import backpackIcon from "./assets/backpack.svg";
import trustwalletIcon from "./assets/trustlogo.svg";
import solanasignLogo from "./assets/solanasign-logo.png";

type WalletId = "phantom" | "solflare" | "glow" | "exodus" | "backpack" | "trustwallet";

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

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ---------- Glow detection (multi-provider friendly) ---------- */
function scanGlow(): any | null {
  const w = window as any;
  if (w.glow?.solana) return w.glow.solana;

  const sol = w.solana;
  const list: any[] = Array.isArray(sol?.providers) ? sol.providers : [];

  if (list.length) {
    const byFlag = list.find((p) => p?.isGlow);
    if (byFlag) return byFlag;
    const byName = list.find(
      (p) => p?.provider === "Glow" || p?.wallet === "Glow" || p?.name === "Glow"
    );
    if (byName) return byName;
  }

  if (sol?.isGlow) return sol;
  if (sol && (sol.provider === "Glow" || sol.wallet === "Glow" || sol.name === "Glow")) return sol;

  if ((w as any).glowSolana) return (w as any).glowSolana;

  return null;
}

/* ---------- Trust Wallet detection (robuste) ---------- */
function scanTrustWallet(): any | null {
  const w = window as any;

  // 1) Injection directe côté extension
  // (certaines versions exposent .solana, d’autres le provider direct)
  if (w.trustwallet?.solana) return w.trustwallet.solana;
  if (w.trustwallet) return w.trustwallet;
  if (w.trustWallet?.solana) return w.trustWallet.solana;
  if (w.trustWallet) return w.trustWallet;

  // 2) Via multi-providers
  const sol = w.solana;
  const providers: any[] = Array.isArray(sol?.providers) ? sol.providers : [];
  if (providers.length) {
    const byFlag = providers.find((p) => p?.isTrust || p?.isTrustWallet);
    if (byFlag) return byFlag;
    const byName = providers.find(
      (p) =>
        p?.name === "Trust Wallet" ||
        p?.wallet === "Trust Wallet" ||
        p?.provider === "Trust Wallet" ||
        p?.name === "Trust"
    );
    if (byName) return byName;
  }

  // 3) Provider unique dans window.solana
  if (sol?.isTrust || sol?.isTrustWallet) return sol;
  if (
    sol &&
    (sol.name === "Trust Wallet" || sol.wallet === "Trust Wallet" || sol.provider === "Trust Wallet" || sol.name === "Trust")
  )
    return sol;

  return null;
}

/* ---------- Deep link + polling pour Glow (comme dans le ZIP) ---------- */
async function deepLinkAndWaitGlow(timeoutMs = 5000): Promise<any | null> {
  try {
    let p = scanGlow();
    if (p) return p;

    (window as any).location.href = "glow://dapp/connect";

    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
      await delay(100);
      p = scanGlow();
      if (p) return p;
    }
    return null;
  } catch {
    return null;
  }
}

/* ---------- Connexion compatible (avec/sans options, puis request) ---------- */
async function connectWithCompat(p: any) {
  try {
    const r = await p.connect?.({ onlyIfTrusted: false });
    return r;
  } catch {
    try {
      const r2 = await p.connect?.();
      return r2;
    } catch {
      const r3 = await p.request?.({ method: "connect" });
      return r3;
    }
  }
}

/* ---------- Liste wallets ---------- */
const WALLETS: {
  id: WalletId;
  label: string;
  icon: string;
  detect: () => any | null;
  install: () => void;
  subtitle: string;
}[] = [
  {
    id: "phantom",
    label: "Phantom",
    icon: phantomIcon,
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
    subtitle: "Extension / Mobile app",
  },
  {
    id: "solflare",
    label: "Solflare",
    icon: solflareIcon,
    detect: () => (window as any).solflare ?? null,
    install: () =>
      window.open(
        isMobile ? "https://solflare.com/" : "https://solflare.com/download",
        "_blank"
      ),
    subtitle: "Extension / Mobile app",
  },
  {
    id: "backpack",
    label: "Backpack",
    icon: backpackIcon,
    detect: () => {
      const w = window as any;
      return w.backpack?.solana || (w.solana?.isBackpack ? w.solana : null);
    },
    install: () => window.open("https://backpack.app/download", "_blank"),
    subtitle: "Extension / Mobile app",
  },
  {
    id: "trustwallet",
    label: "Trust Wallet",
    icon: trustwalletIcon,
    detect: () => scanTrustWallet(),
    install: () =>
      window.open("https://trustwallet.com/browser-extension", "_blank"),
    subtitle: "Extension only",
  },
  {
    id: "glow",
    label: "Glow",
    icon: glowIcon,
    detect: () => scanGlow(),
    install: () => window.open("https://glow.app/download", "_blank"),
    subtitle: "Extension only",
  },
  {
    id: "exodus",
    label: "Exodus",
    icon: exodusIcon,
    detect: () => {
      const w = window as any;
      const p = w.exodus?.solana || w.solana;
      return p && (p.isExodus || p?.provider === "Exodus") ? p : null;
    },
    install: () => window.open("https://www.exodus.com/download/", "_blank"),
    subtitle: "Extension only",
  },
];

export default function App() {
  const [provider, setProvider] = useState<any>(null);
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const [msg, setMsg] = useState("");
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [copied, setCopied] = useState(false);
  const [showUseCasesModal, setShowUseCasesModal] = useState(false);

  const connected = !!provider && !!pubkey;
  const disabled = !connected || !msg.trim() || busy;

  async function pickWallet(id: WalletId) {
    setPickerOpen(false);
    const w = WALLETS.find((x) => x.id === id)!;

    let p = w.detect();

    // Deep link + polling pour Glow (desktop/mobile)
    if (!p && id === "glow") {
      p = await deepLinkAndWaitGlow(5000);
    }

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
          await delay(0);
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
    try { await provider?.disconnect?.(); } catch {}
    setProvider(null);
    setPubkey(null);
    setSig(null);
    setCopied(false);
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
    setCopied(false);
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

  async function copySignature() {
    if (!sig) return;
    try {
      await navigator.clipboard.writeText(sig);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (e) {
      console.warn("Clipboard failed", e);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* BACKGROUND de page (léger fond global) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-grid bg-[length:22px_22px]" />
        <div className="absolute inset-0 bg-[radial-gradient(70rem_60rem_at_90%_0%,rgba(14,165,233,.18),transparent_60%)]" />
      </div>

      {/* HEADER */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-4 md:py-6 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3">
            <img
              src={solanasignLogo}
              alt="SolanaSign"
              className="h-[4.8rem] w-[4.8rem] rounded-xl"
            />
            <div>
              <p className="text-lg font-semibold tracking-tight">SolanaSign</p>
              <p className="text-xs text-slate-400 -mt-1">Sign a message • Prove ownership</p>
            </div>
          </a>

          {/* Wrapper RELATIF pour ancrer le halo au bouton */}
          <div className="relative flex items-center gap-3">
            {/* Halo collé au bouton (ne bouge plus avec la largeur d'écran) */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -z-10"
            >
              <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 md:translate-x-4 w-[28rem] h-[28rem] rounded-full opacity-80
                               bg-[radial-gradient(14rem_14rem_at_center,rgba(14,165,233,.28),transparent_60%)]" />
            </span>

            {connected && (
              <span className="text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-emerald-300">
                {pubkey?.slice(0,4)}…{pubkey?.slice(-4)}
              </span>
            )}
            {!connected ? (
              <button
                onClick={() => setPickerOpen(true)}
                className="relative rounded-xl px-4 py-2 text-sm font-medium bg-sky-500 text-sky-950 hover:bg-sky-400 transition shadow-glow"
              >
                Connect wallet
              </button>
            ) : (
              <button
                onClick={disconnect}
                className="relative rounded-xl px-4 py-2 text-sm font-medium
                           bg-gradient-to-r from-sky-600 to-sky-500
                           text-white hover:from-sky-500 hover:to-sky-400
                           transition shadow-glow"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </header>

      {/* HERO + CARD */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
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

            {/* Card */}
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

                  <div
                    role="button"
                    tabIndex={0}
                    onClick={copySignature}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && copySignature()}
                    title="Click to copy"
                    className="relative mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 text-xs
                               break-all hover:bg-slate-800 outline-none focus:ring-4 focus:ring-brand.ring
                               cursor-pointer transition"
                  >
                    {sig}

                    <span
                      className={`pointer-events-none absolute -top-2 -right-2 select-none rounded-full 
                                  bg-emerald-500 text-emerald-950 text-[10px] font-semibold px-2 py-[2px]
                                  shadow ${copied ? 'opacity-100 scale-100' : 'opacity-0 scale-90'} transition`}
                      aria-hidden="true"
                    >
                      Copied!
                    </span>

                    <div className="absolute right-2.5 bottom-2.5 opacity-70 hover:opacity-100 transition" aria-hidden="true">
                      <svg width="16" height="16" viewBox="0 0 24 24" className="text-slate-300">
                        <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="mt-2 text-xs text-slate-400">
                    Click anywhere in the box to copy.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} SolanaSign</span>
          <div className="flex items-center gap-4">
            <a
              className="hover:text-slate-200"
              href="https://github.com/mjukilo/solanasign.io"
              rel="nofollow noopener noreferrer"
            >
              GitHub
            </a>
            {/* Use cases caché (préservé pour plus tard) */}
            <button
              onClick={() => setShowUseCasesModal(true)}
              className="hidden hover:text-slate-200 underline decoration-dotted"
              title="Open use cases"
            >
              Use cases
            </button>
          </div>
        </div>
      </footer>

      {/* Wallet picker */}
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
                  <img src={w.icon} alt={w.label} className="h-7 w-7 rounded-md object-contain" />
                  <div>
                    <div className="text-sm font-medium">{w.label}</div>
                    <div className="text-xs text-slate-400">{w.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="px-5 pb-4 pt-2 text-xs text-slate-400">
              Mobile tip: open this page inside your wallet's in-app browser.
            </div>
          </div>
        </div>
      )}

      {/* Use cases modal (resté dispo mais lien caché) */}
      {showUseCasesModal && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" onClick={() => setShowUseCasesModal(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative mx-auto mt-24 w-[92%] max-w-2xl rounded-2xl border border-slate-700 bg-slate-900 text-slate-100 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
              <div className="text-sm font-semibold">Use cases</div>
              <button
                onClick={() => setShowUseCasesModal(false)}
                className="rounded-lg border border-slate-700/60 px-2.5 py-1 text-xs hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>

            <div className="m-4 text-sm text-slate-300 space-y-3">
              <p className="text-slate-200 font-medium">Common use cases</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Prove ownership of a wallet (KYC-less login, support, community gates)</li>
                <li>Bind a wallet to a user account (account linking)</li>
                <li>Anti-fraud: sign challenges containing timestamp + domain (replay protection)</li>
                <li>Off-chain authorization for premium features or allow-lists</li>
              </ul>
              <p className="text-slate-400 text-xs">
                Tip: always verify the signature over the exact same message bytes (UTF-8) and decode signature from base58.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
