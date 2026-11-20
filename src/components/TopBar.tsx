import { Sparkles } from "lucide-react";
import type { StudioViewTab } from "../types/poster";

interface TopBarProps {
  activeView: StudioViewTab;
  onSelectView: (view: StudioViewTab) => void;
  onFocusEditor: () => void;
  onGeneratePoster: () => void;
  isGenerating: boolean;
}

export function TopBar({
  activeView,
  onSelectView,
  onFocusEditor,
  onGeneratePoster,
  isGenerating,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-6 py-3.5">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectView("template");
          }}
          className="font-display text-lg font-bold tracking-tight text-[#0B2447] whitespace-nowrap shrink-0"
        >
          Kemasku Studio
        </a>

        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-6 text-sm font-medium"
        >
          <button
            type="button"
            onClick={onFocusEditor}
            className="text-slate-600 hover:text-[#0B2447] transition-colors whitespace-nowrap shrink-0 py-1 cursor-pointer"
          >
            Editor Variabel
          </button>
          <button
            type="button"
            onClick={() => onSelectView("template")}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeView === "template"
                ? "border-[#EA580C] text-[#0B2447] font-semibold"
                : "border-transparent text-slate-600 hover:text-[#0B2447]"
            }`}
          >
            Master Prompt
          </button>
          <button
            type="button"
            onClick={() => onSelectView("compiled")}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeView === "compiled"
                ? "border-[#EA580C] text-[#0B2447] font-semibold"
                : "border-transparent text-slate-600 hover:text-[#0B2447]"
            }`}
          >
            Blueprint Poster
          </button>
          <button
            type="button"
            onClick={() => onSelectView("render")}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
              activeView === "render"
                ? "border-[#EA580C] text-[#0B2447] font-semibold"
                : "border-transparent text-slate-600 hover:text-[#0B2447]"
            }`}
          >
            Generate AI
          </button>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onGeneratePoster}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C2410C] disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isGenerating ? "Merender..." : "Generate Poster AI"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
