import Header from "./components/Header";
import SignCard from "./components/SignCard";
import "./styles.css";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-bg text-ink">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 pt-8 pb-16 grid md:grid-cols-2 gap-10 items-start">
          {/* Left hero */}
          <section className="pt-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              Prove wallet ownership
              <br />
              <span className="text-accent">by signing a message.</span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-muted max-w-[48ch]">
              Works with Phantom, Solflare, Backpack, Glow, Exodus and more.
              No passwords, no email—just cryptographic proof.
            </p>

            <ul className="mt-6 space-y-2 text-sm text-muted">
              <li>• Non-custodial • stays in your wallet</li>
              <li>• bs58 signature output</li>
              <li>• Copy &amp; share instantly</li>
            </ul>
          </section>

          {/* Right panel */}
          <aside>
            <div className="rounded-2xl border border-line bg-panel/40 p-[1px]">
              <SignCard />
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-line/60">
        <div className="mx-auto max-w-[1200px] px-4 py-6 flex items-center gap-4 justify-end">
          <a
            className="text-sm text-muted hover:text-ink"
            href="https://github.com/mjukilo/solanasign.io"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const toggle = () => {
    const el = document.documentElement;
    el.classList.toggle("dark");
  };
  return (
    <button onClick={toggle} className="btn btn-ghost rounded-full px-4 py-2 text-sm">
      Toggle theme
    </button>
  );
}
