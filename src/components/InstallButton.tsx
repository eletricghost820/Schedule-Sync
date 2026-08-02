import { useEffect, useState } from "react";
import { Download, Share, Plus, X } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showSheet, setShowSheet] = useState(false);

  useEffect(() => {
    setMounted(true);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setInstalled(standalone);

    const ua = window.navigator.userAgent;
    const iOSDevice =
      /iPad|iPhone|iPod/.test(ua) ||
      (ua.includes("Macintosh") && "ontouchend" in document);
    setIsIOS(iOSDevice);

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowSheet(false);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!mounted || installed) return null;

  const handleClick = async () => {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      setDeferred(null);
      if (choice.outcome === "accepted") setInstalled(true);
      return;
    }
    setShowSheet(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 ${className}`}
      >
        <Download className="size-4" />
        Install Schedule Sync
      </button>

      {showSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-background/70 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Install Schedule Sync"
          onClick={() => setShowSheet(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <img
                src={logoAsset.url}
                alt=""
                width={44}
                height={44}
                className="size-11 rounded-xl"
              />
              <div className="min-w-0">
                <p className="font-display text-base font-bold leading-tight">
                  Add to Home Screen
                </p>
                <p className="text-xs text-muted-foreground">
                  Opens fullscreen, just like an app.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setShowSheet(false)}
                className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <ol className="mt-5 space-y-3 text-sm">
              {(isIOS
                ? [
                    <>
                      Tap the <Share className="inline size-4 -translate-y-px text-primary" />{" "}
                      <span className="font-semibold">Share</span> button in Safari's toolbar
                    </>,
                    <>
                      Scroll down and tap{" "}
                      <span className="font-semibold">Add to Home Screen</span>{" "}
                      <Plus className="inline size-4 -translate-y-px text-primary" />
                    </>,
                    <>
                      Tap <span className="font-semibold">Add</span> — the icon lands on your
                      home screen
                    </>,
                  ]
                : [
                    <>
                      Open your browser's <span className="font-semibold">menu</span> (⋮)
                    </>,
                    <>
                      Choose <span className="font-semibold">Install app</span> or{" "}
                      <span className="font-semibold">Add to Home screen</span>
                    </>,
                    <>
                      Confirm — Schedule Sync opens fullscreen from your home screen
                    </>,
                  ]
              ).map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-display text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-muted-foreground">{step}</span>
                </li>
              ))}
            </ol>

            {isIOS && (
              <p className="mt-4 rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
                Heads up: on iPhone this only works in <span className="font-semibold">Safari</span>,
                not Chrome.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}