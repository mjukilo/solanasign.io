import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";
import bs58 from "bs58";

export default function SignCard() {
  const { signMessage, connected } = useWallet();
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canSign = connected && signMessage;

  const onSign = async () => {
    if (!canSign || !message) return;
    setBusy(true);
    setSignature(null);
    try {
      const enc = new TextEncoder().encode(message);
      const sig = await signMessage!(enc);
      setSignature(bs58.encode(sig));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card p-6 md:p-8 w-full">
      <h3 className="text-lg font-semibold mb-3">Message to sign</h3>
      <textarea
        rows={6}
        className="textarea"
        placeholder="Write the exact message you want to sign"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="mt-3 text-sm text-muted">
        Tip: include a timestamp & domain to avoid replay.
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          className="btn btn-primary disabled:opacity-60"
          onClick={onSign}
          disabled={!canSign || !message || busy}
        >
          {busy ? "Signing…" : "Sign message"}
        </button>
        {!connected && (
          <span className="text-sm text-muted">Connect a wallet first.</span>
        )}
      </div>

      {signature && (
        <div className="mt-6">
          <div className="text-sm text-muted mb-2">bs58 signature output</div>
          <div className="rounded-2xl border border-line bg-panel/60 p-4 text-xs break-all">
            {signature}
          </div>
          <div className="mt-3">
            <button
              className="btn btn-ghost"
              onClick={() => navigator.clipboard.writeText(signature)}
            >
              Copy & share instantly
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
