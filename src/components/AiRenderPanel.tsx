import { ManualApiBox } from "./ManualApiBox";
import { Download, Image as ImageIcon, Loader2, Sparkles, Trash2 } from "lucide-react";
import type { GeneratedRenderItem, PosterVariables } from "../types/poster";

interface AiRenderPanelProps {
  variables: PosterVariables;
  compiledPrompt: string;
  qualityMode: "standard" | "hd";
  useReferenceLayout: boolean;
  isGenerating: boolean;
  errorMessage: string | null;
  currentRender: GeneratedRenderItem | null;
  history: GeneratedRenderItem[];
  onQualityChange: (mode: "standard" | "hd") => void;
  onReferenceToggle: (val: boolean) => void;
  onGenerate: () => void;
  onSelectHistory: (item: GeneratedRenderItem) => void;
  onClearHistory: () => void;
}

export function AiRenderPanel({
  variables,
  compiledPrompt,
  qualityMode,
  useReferenceLayout,
  isGenerating,
  errorMessage,
  currentRender,
  history,
  onQualityChange,
  onReferenceToggle,
  onGenerate,
  onSelectHistory,
  onClearHistory,
}: AiRenderPanelProps) {
  const handleDownload = (item: GeneratedRenderItem) => {
    const link = document.createElement("a");
    link.download = `poster-${item.brandName.toLowerCase().replace(/\s+/g, "-")}-${item.id}.png`;
    link.href = item.imageDataUrl;
    link.click();
  };

  return (
    <>
      <div className="space-y-5">
        <ManualApiBox />

        <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-bold text-[#0B2447]">
                Generate Poster Produk via Gemini AI
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Menggunakan Prompt Final terkompilasi untuk produk{" "}
                <span className="font-semibold text-slate-700">
                  {variables.judul_produk} {variables.sorotan_judul}
                </span>
                {variables.logo_image_url ? " beserta logo brand yang Anda unggah." : "."}
              </p>
            </div>

            <button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 rounded-lg bg-[#EA580C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#C2410C] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap"
            >
              {isGenerating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{isGenerating ? "Sedang Merender..." : "Generate Gambar Sekarang"}</span>
            </button>
          </div>

          {/* Render Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Mode Model Gambar
              </label>
              <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => onQualityChange("standard")}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    qualityMode === "standard"
                      ? "bg-white text-[#0B2447] shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Standar (Cepat)
                </button>
                <button
                  type="button"
                  onClick={() => onQualityChange("hd")}
                  className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    qualityMode === "hd"
                      ? "bg-white text-[#0B2447] shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  HD 2K (Tajam)
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2 cursor-pointer hover:bg-slate-50">
                <input
                  type="checkbox"
                  checked={useReferenceLayout}
                  onChange={(e) => onReferenceToggle(e.target.checked)}
                  className="mt-0.5 accent-[#EA580C]"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-800">
                    Kunci Tata Letak Referensi Asli
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Menjaga posisi badge, barisan ukuran, dan kartu bawah tetap presisi.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Error Display */}
          {errorMessage && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 leading-relaxed"
            >
              <div className="font-semibold mb-0.5">Gagal Merender Gambar AI</div>
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Active Output Frame */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4">
            {isGenerating ? (
              <div className="mx-auto max-w-[460px] aspect-square rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center gap-3 p-6 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#EA580C]" />
                <div className="text-sm font-semibold text-[#0B2447]">
                  Merender Poster Katalog AI...
                </div>
                <p className="text-xs text-slate-500 max-w-xs">
                  Gemini sedang menyusun tipografi, barisan varian produk, badge ukuran, dan refleksi lantai studio.
                </p>
              </div>
            ) : currentRender ? (
              <div className="space-y-3">
                <div className="mx-auto max-w-[520px] rounded-lg border border-slate-200 bg-white overflow-hidden">
                  <img
                    src={currentRender.imageDataUrl}
                    alt={`Poster AI ${currentRender.productTitle}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-slate-600">
                    <span className="font-semibold text-slate-900">
                      {currentRender.productTitle}
                    </span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="font-mono text-[11px]">{currentRender.modelUsed}</span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    <span className="tabular-nums">{currentRender.aspectRatio}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownload(currentRender)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2447] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#153668] transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Unduh Gambar PNG</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-[460px] py-12 flex flex-col items-center justify-center text-center gap-2.5">
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-slate-400">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Belum Ada Hasil Render AI
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Klik tombol <strong>Generate Gambar Sekarang</strong> untuk menghasilkan poster produk menggunakan prompt aktif ({compiledPrompt.length} karakter).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Render History Gallery */}
        {history.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-sm font-bold text-[#0B2447]">
                Riwayat Render Sesi ({history.length})
              </h3>
              <button
                type="button"
                onClick={onClearHistory}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Bersihkan</span>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectHistory(item)}
                  className={`group text-left rounded-lg border overflow-hidden transition-colors cursor-pointer ${
                    currentRender?.id === item.id
                      ? "border-[#EA580C]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="aspect-square bg-slate-50 overflow-hidden">
                    <img
                      src={item.imageDataUrl}
                      alt={item.productTitle}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="p-2 bg-white">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {item.productTitle}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {item.brandName} · {item.aspectRatio}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
