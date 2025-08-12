import { useMemo, useState } from "react";
import bs58 from "bs58";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

/* ====== Icônes (inchangées) ====== */
function CheckIcon(props: React.SVGProps<SVGSVGElement>) { /* ... même code ... */ return (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
);}
function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M16 4h-1a2 2 0 0 0-4 0H10a2 2 0 0 0-2 2v1H7a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-1V6a2 2 0 0 0-2-2zm-3 0a1 1 0 0 1 1 1v1h-2V5a1 1 0 0 1 1-1z"/></svg>
);}
function ExternalIcon(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z"/></svg>
);}
function LogoMark(props: React.SVGProps<SVGSVGElement>) { /* ... */ return (
  <svg viewBox="0 0 24 24" aria-hidden="true" {...props}><path fill="currentColor" d="M4 7h16l-2 4H6l-2-4zm2 6h12l-2 4H8l-2-4z"/></svg>
);}

/* ====== UI helpers ====== */
function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      aria-label="Copy signature to clipboard"
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false),1200); }}
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
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-800/70 bg-slate-950/85 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60 md:hidden"
         style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto max-w-6xl px-4 py-3">
        <button
          onClick={onSign}
          disabled={disabled}
          className={`w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
            disabled ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-sky-500 text-sky-950 hover:bg-sky-400"
          }`}
        >
          {disabled ? "Ready to sign…" : "Sign message"}
        </button>
      </div>
    </div>
  );
}

/* ====== App ====== */
export default function App() {
  const { publicKey, connected, signMessage } = useWallet();
  const pubkey58 = useMemo(() => (publicKey ? publicKey.toBase58() : null), [publicKey]);

  const [msg, setMsg] = useState("I am proving I own this wallet on " + new Date().toISOString());
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const disabled = !connected || !msg.trim() || busy;

  const sign = async () => {
    if (!connected) return;
    if (!signMessage) {
      alert("This wallet does not support message signing. Try Phantom, Solflare or Backpack.");
      return;
    }
    setBusy(true);
    setSig(null);
    try {
      const encoded = new TextEncoder().encode(msg);
      const rawSig = await signMessage(encoded);        // <-- ouvre pop-up d’extension si nécessaire
      const signature = bs58.encode(rawSig);
      setSig(signature);
    } catch (e) {
      console.error(e);
      alert("Signature cancelled or failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_60rem_at_80%_-10%,rgba(14,165,233,.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid bg-[length:22px_22px]" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/20 ring-1 ring-sky-400/30 backdrop-blur flex items-center justify-center">
              <LogoMark className="h-4 w-4 text-sky-300" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">SolanaSign</p>
              <p className="text-xs text-slate-400 -mt-1">Sign a message • Prove ownership</p>
            </div>
          </a>

          {/* Remplace notre ancien bouton par WalletMultiButton */}
          <div className="flex items-center gap-3 w-full max-w-[60%] justify-end">
            {connected && pubkey58 ? (
              <span className="max-w-[40vw] truncate text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-emerald-300">
                {pubkey58.slice(0, 4)}…{pubkey58.slice(-4)}
              </span>
            ) : null}

            {/* Ce composant ouvre la modale multi-wallet et déclenche le pop-up de l’extension si injectée */}
            <WalletMultiButton className="!rounded-xl !px-4 !py-3 !text-sm !font-medium !bg-sky-500 !text-sky-950 hover:!bg-sky-400 !transition !shadow-glow" />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-stretch">
            {/* Left */}
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Prove wallet ownership<br/><span className="text-sky-400">by signing a message</span>.
              </h1>
              <p className="mt-4 text-slate-300/90 leading-relaxed">
                Works with Phantom, Solflare, Backpack, Glow, Exodus and more. No passwords, no email—just cryptographic proof.
              </p>
              <ul className="mt-6 space-y-2 text-slate-300/80 text-sm">
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-400" /> Non-custodial • stays in your wallet</li>
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-400" /> bs58 signature output</li>
                <li className="flex items-center gap-2"><CheckIcon className="h-4 w-4 text-emerald-400" /> Copy & share instantly</li>
              </ul>
            </div>

            {/* Card */}
            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/50 backdrop-blur p-4 sm:p-8 shadow-glow">
              <label className="block text-sm font-medium text-slate-300">Message to sign</label>
              <textarea
                value={msg}
                onChange={(e)=>setMsg(e.target.value)}
                rows={6}
                inputMode="text"
                placeholder="Write the exact message you want to sign"
                className="mt-2 w-full rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-3 text-base md:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-brand.ring"
              />

              <div className="mt-4 flex flex-col md:flex-row items-center gap-3 md:gap-4 justify-between">
                <p className="text-xs text-slate-400 self-start">Tip: include a timestamp & domain to avoid replay.</p>
                <button
                  onClick={sign}
                  disabled={disabled}
                  className={`w-full md:w-auto rounded-xl px-4 py-3 text-sm font-semibold transition shadow-glow ${
                    disabled ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-sky-500 text-sky-950 hover:bg-sky-400"
                  }`}
                >
                  {busy ? "Signing…" : "Sign message"}
                </button>
              </div>

              {sig && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-300">Signature (bs58)</label>
                  <div className="mt-2 rounded-xl border border-slate-700/60 bg-slate-800/60 p-3 text-xs break-all">{sig}</div>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <Copy text={sig} />
                    <a
                      aria-label="Open wallet in Solana Explorer"
                      href={`https://explorer.solana.com/address/${pubkey58 ?? ""}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm underline decoration-dotted hover:opacity-90"
                    >
                      <ExternalIcon className="h-4 w-4" />
                      View wallet on Explorer
                    </a>
                  </div>

                  <details className="mt-4 group">
                    <summary className="cursor-pointer text-sm text-slate-300/90 hover:text-slate-200">How to verify this signature</summary>
                    <div className="mt-3 text-sm text-slate-300/80 space-y-2">
                      <p>Use <code>tweetnacl</code> or <code>@solana/web3.js</code> to verify the signature bytes over the exact same message, using the wallet public key.</p>
                      <p className="text-slate-400">Make sure the verifier encodes the message as UTF-8 and decodes the signature from base58.</p>
                    </div>
                  </details>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Mobile bottom action bar */}
        {connected && msg.trim().length > 0 && (
          <MobileActionBar disabled={disabled} onSign={sign} />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-4 sm:py-6 text-sm text-slate-400 flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} SolanaSign</span>
          <div className="flex items-center gap-4">
            <a className="hover:text-slate-200" href="https://github.com/mjukilo/solanasign.io">GitHub</a>
            <button
              onClick={() => document.documentElement.classList.toggle("dark")}
              className="rounded-xl border border-slate-700/60 px-3 py-1"
              title="Toggle dark mode"
            >
              Toggle theme
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
