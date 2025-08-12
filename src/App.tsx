import { useEffect, useMemo, useState } from "react";
import bs58 from "bs58";

function Copy({ text }: { text: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false), 1200); }}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/60 px-3 py-2 text-sm hover:bg-slate-800 transition"
      title="Copy to clipboard"
    >
      <span className="i-lucide-clipboard h-4 w-4" />
      {ok ? "Copied!" : "Copy"}
    </button>
  );
}

export default function App() {
  const [connected, setConnected] = useState(false);      // à connecter à l'état réel du wallet
  const [pubkey, setPubkey] = useState<string | null>(null); // à connecter au vrai publicKey?.toBase58()
  const [msg, setMsg] = useState("I am proving I own this wallet on " + new Date().toISOString());
  const [sig, setSig] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const disabled = !connected || !msg.trim() || busy;

  // TODO: branche ta logique de connexion/adapter ici
  const connectWallet = async () => {
    // ... open adapter modal, then:
    // setConnected(true); setPubkey(publicKey.toBase58());
  };

  const sign = async () => {
    if (!connected) return;
    setBusy(true); setSig(null);
    try {
      // 👉 Branche ici ta vraie fonction de signature:
      // const encoded = new TextEncoder().encode(msg);
      // const rawSig = await signMessage(encoded);
      // const signature = bs58.encode(rawSig);
      const signature = "REPLACE_WITH_REAL_SIGNATURE"; // placeholder
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
      {/* Fond */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60rem_60rem_at_80%_-10%,rgba(14,165,233,.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-grid bg-[length:22px_22px]" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-sky-500/20 ring-1 ring-sky-400/30 backdrop-blur flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" className="text-sky-300">
                <path fill="currentColor" d="M4 7h16l-2 4H6l-2-4zm2 6h12l-2 4H8l-2-4z"/>
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight">SolanaSign</p>
              <p className="text-xs text-slate-400 -mt-1">Sign a message • Prove ownership</p>
            </div>
          </a>
          <div className="flex items-center gap-3">
            {connected ? (
              <span className="text-xs rounded-full bg-emerald-400/10 border border-emerald-400/30 px-3 py-1 text-emerald-300">
                {pubkey?.slice(0,4)}…{pubkey?.slice(-4)}
              </span>
            ) : null}
            <button
              onClick={connectWallet}
              className="rounded-xl px-4 py-2 text-sm font-medium bg-sky-500 text-sky-950 hover:bg-sky-400 transition shadow-glow"
            >
              {connected ? "Change wallet" : "Connect wallet"}
            </button>
          </div>
        </div>
      </header>

      {/* Hero + Card */}
      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            <div className="flex flex-col justify-center">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                Prove wallet ownership<br/><span className="text-sky-400">by signing a message</span>.
              </h1>
              <p className="mt-4 text-slate-300/90 leading-relaxed">
                Works with Phantom, Solflare, Backpack, Glow, Exodus and more. No passwords, no email—just cryptographic proof.
              </p>
              <ul className="mt-6 space-y-2 text-slate-300/80 text-sm">
                <li className="flex items-center gap-2"><span className="i-lucide-check h-4 w-4 text-emerald-400" /> Non-custodial • stays in your wallet</li>
                <li className="flex items-center gap-2"><span className="i-lucide-check h-4 w-4 text-emerald-400" /> bs58 signature output</li>
                <li className="flex items-center gap-2"><span className="i-lucide-check h-4 w-4 text-emerald-400" /> Copy & share instantly</li>
              </ul>
            </div>

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
                    <Copy text={sig} />
                    <a
                      href={`https://explorer.solana.com/address/${pubkey ?? ""}`}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm underline decoration-dotted hover:opacity-90"
                    >
                      <span className="i-lucide-external-link h-4 w-4" /> View wallet on Explorer
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
      </main>

      {/* Footer */}
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
    </div>
  );
}
