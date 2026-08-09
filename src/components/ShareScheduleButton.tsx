import { useState, type RefObject } from "react";
import { Share2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import logoAsset from "@/assets/logo.png.asset.json";

const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1920;

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function buildFooter() {
  return buildFooterEl();
}

let fontCssCache: string | null = null;
async function getFontEmbedCss() {
  if (fontCssCache !== null) return fontCssCache;
  const hrefs = Array.from(
    document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
  )
    .map((l) => l.href)
    .filter((h) => h.startsWith("http") && !h.startsWith(window.location.origin));
  const parts: string[] = [];
  for (const href of hrefs) {
    try {
      const res = await fetch(href);
      if (res.ok) parts.push(await res.text());
    } catch {
      /* ignore — falls back to system fonts */
    }
  }
  fontCssCache = parts.join("\n");
  return fontCssCache;
}

function buildFooterEl() {
  const footer = document.createElement("div");
  footer.style.display = "flex";
  footer.style.alignItems = "center";
  footer.style.gap = "16px";
  footer.style.marginTop = "48px";
  footer.style.paddingTop = "28px";
  footer.style.borderTop = `2px solid ${cssVar("--border", "#333")}`;

  const logo = document.createElement("img");
  logo.src = logoAsset.url;
  logo.width = 56;
  logo.height = 56;
  logo.style.width = "56px";
  logo.style.height = "56px";
  logo.style.borderRadius = "14px";
  footer.appendChild(logo);

  const text = document.createElement("div");
  const name = document.createElement("div");
  name.textContent = "Schedule Sync";
  name.style.fontFamily = cssVar("--font-display", "sans-serif");
  name.style.fontWeight = "700";
  name.style.fontSize = "26px";
  name.style.color = cssVar("--foreground", "#fff");
  const url = document.createElement("div");
  url.textContent = "friend-period-finder.lovable.app";
  url.style.fontSize = "20px";
  url.style.color = cssVar("--primary", "#a855f7");
  text.appendChild(name);
  text.appendChild(url);
  footer.appendChild(text);

  return footer;
}

export function ShareScheduleButton({
  targetRef,
  fileName,
  shareTitle,
  className = "",
}: {
  targetRef: RefObject<HTMLElement | null>;
  fileName: string;
  shareTitle: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);

  const handleShare = async () => {
    const source = targetRef.current;
    if (!source || busy) return;
    setBusy(true);

    const holder = document.createElement("div");
    const stage = document.createElement("div");
    try {
      const { toBlob } = await import("html-to-image");

      const contentWidth = Math.max(source.scrollWidth, source.offsetWidth);
      const wide = contentWidth > CARD_WIDTH - 96;
      const width = wide ? contentWidth + 96 : CARD_WIDTH;

      holder.style.position = "fixed";
      holder.style.top = "0";
      holder.style.left = "-100000px";
      holder.style.zIndex = "-1";
      holder.style.pointerEvents = "none";

      stage.style.position = "static";
      stage.style.width = `${width}px`;
      stage.style.boxSizing = "border-box";
      stage.style.padding = "48px";
      stage.style.display = "flex";
      stage.style.flexDirection = "column";
      stage.style.background = cssVar("--background", "#101014");
      stage.style.color = cssVar("--foreground", "#fff");
      stage.style.fontFamily = cssVar("--font-body", "sans-serif");
      if (!wide) stage.style.minHeight = `${CARD_HEIGHT}px`;

      const clone = source.cloneNode(true) as HTMLElement;
      clone.style.width = "100%";
      clone.style.flex = "1 1 auto";
      clone.querySelectorAll("[data-share-hide]").forEach((el) => el.remove());
      clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
        el.style.overflow = "visible";
        el.style.animation = "none";
        el.style.transition = "none";
      });
      stage.appendChild(clone);
      stage.appendChild(buildFooter());
      holder.appendChild(stage);
      document.body.appendChild(holder);

      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const blob = await toBlob(stage, {
        pixelRatio: 2,
        backgroundColor: cssVar("--background", "#101014"),
        cacheBust: true,
        fontEmbedCSS: await getFontEmbedCss(),
      });
      if (!blob) throw new Error("Could not render image");

      const file = new File([blob], `${fileName}.png`, { type: "image/png" });
      const canShareFile =
        typeof navigator !== "undefined" &&
        !!navigator.share &&
        !!navigator.canShare?.({ files: [file] });

      if (canShareFile) {
        try {
          await navigator.share({ files: [file], title: shareTitle });
          toast.success("Shared!");
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
          throw err;
        }
      } else {
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = `${fileName}.png`;
        a.click();
        URL.revokeObjectURL(href);
        toast.success("Image downloaded");
      }
    } catch (err) {
      console.error(err);
      toast.error("Couldn't create the share image. Try again.");
    } finally {
      holder.remove();
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      data-share-hide
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-60 ${className}`}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Share2 className="size-4" />
      )}
      {busy ? "Creating image…" : "Share Schedule"}
    </button>
  );
}