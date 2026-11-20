import { useEffect, useState } from "react";
import { TopBar } from "./components/TopBar";
import { VariableConfigurator } from "./components/VariableConfigurator";
import { MasterPromptPanel } from "./components/MasterPromptPanel";
import { BlueprintPreview } from "./components/BlueprintPreview";
import { AiRenderPanel } from "./components/AiRenderPanel";
import { compileMasterPrompt, PRESET_TEMPLATES } from "./data/masterPrompt";
import type {
  EditorTabId,
  FeatureIconKey,
  GeneratedRenderItem,
  PosterVariables,
  StudioViewTab,
} from "./types/poster";

const STORAGE_VARS_KEY = "kemasku_studio_vars_v1";
const STORAGE_HISTORY_KEY = "kemasku_studio_history_v1";

const VALID_ICON_KEYS: FeatureIconKey[] = [
  "package",
  "leaf",
  "shield-bolt",
  "shield-check",
  "droplet",
  "sparkles",
  "layers",
  "truck",
];

function loadInitialVariables(): PosterVariables {
  try {
    const saved = localStorage.getItem(STORAGE_VARS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PosterVariables;
      if (parsed && parsed.nama_brand && Array.isArray(parsed.varian_ukuran)) {
        return parsed;
      }
    }
  } catch {
    // Ignore invalid storage
  }
  return PRESET_TEMPLATES[0].variables;
}

function loadInitialHistory(): GeneratedRenderItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GeneratedRenderItem[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore invalid storage
  }
  return [];
}

export default function App() {
  const [variables, setVariables] = useState<PosterVariables>(loadInitialVariables);
  const [activePresetId, setActivePresetId] = useState<string>("kemasku-tictas");
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTabId>("brand");
  const [activeStudioView, setActiveStudioView] = useState<StudioViewTab>("template");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [autoFillError, setAutoFillError] = useState<string | null>(null);

  const [qualityMode, setQualityMode] = useState<"standard" | "hd">("standard");
  const [useReferenceLayout, setUseReferenceLayout] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const [renderHistory, setRenderHistory] = useState<GeneratedRenderItem[]>(loadInitialHistory);
  const [currentRender, setCurrentRender] = useState<GeneratedRenderItem | null>(
    () => loadInitialHistory()[0] ?? null
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VARS_KEY, JSON.stringify(variables));
    } catch {
      // Ignore quota errors
    }
  }, [variables]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(renderHistory.slice(0, 9)));
    } catch {
      // Ignore quota errors
    }
  }, [renderHistory]);

  const compiledPrompt = compileMasterPrompt(variables);

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_TEMPLATES.find((p) => p.id === presetId);
    if (!found) return;
    setActivePresetId(found.id);
    setVariables(found.variables);
    setAutoFillError(null);
  };

  const handleVariablesChange = (updated: PosterVariables) => {
    setVariables(updated);
    setActivePresetId("custom");
  };

  const handleJumpToVariable = (
    tab: EditorTabId,
    key: string,
    inputId?: string
  ) => {
    setActiveEditorTab(tab);
    setHighlightedField(key);
    setTimeout(() => {
      if (inputId) {
        const el = document.getElementById(inputId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.focus();
        }
      } else {
        document.getElementById("editor-variabel")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 60);
    setTimeout(() => setHighlightedField(null), 1800);
  };

  const handleAutoFill = async (productIdea: string) => {
    setIsAutoFilling(true);
    setAutoFillError(null);
    try {
      const response = await fetch("/api/ai/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productIdea,
          currentBrand: variables.nama_brand,
        }),
      });
      const data = (await response.json()) as {
        variables?: Partial<PosterVariables>;
        error?: string;
      };
      if (!response.ok || !data.variables) {
        throw new Error(data.error || "Gagal mengisi variabel otomatis.");
      }

      const incoming = data.variables;
      const normalizedVariants = (incoming.varian_ukuran ?? variables.varian_ukuran)
        .slice(0, 6)
        .map((v, idx) => ({
          id: `ai-var-${Date.now()}-${idx}`,
          label_ukuran: v.label_ukuran || `Ukuran ${idx + 1}`,
          label_kapasitas: v.label_kapasitas || "",
          skala_tinggi: Math.min(100, Math.max(45, Number(v.skala_tinggi) || 55 + idx * 10)),
        }));

      const normalizedFeatures = (incoming.daftar_fitur ?? variables.daftar_fitur)
        .slice(0, 4)
        .map((f, idx) => {
          const safeKey = VALID_ICON_KEYS.includes(f.ikon_key as FeatureIconKey)
            ? (f.ikon_key as FeatureIconKey)
            : VALID_ICON_KEYS[idx % VALID_ICON_KEYS.length];
          return {
            id: `ai-feat-${Date.now()}-${idx}`,
            ikon_key: safeKey,
            ikon_deskripsi: f.ikon_deskripsi || "Ikon garis minimalis",
            label: f.label || "Kualitas Terjamin",
          };
        });

      setVariables((prev) => ({
        ...prev,
        ...incoming,
        varian_ukuran:
          normalizedVariants.length >= 2 ? normalizedVariants : prev.varian_ukuran,
        daftar_fitur:
          normalizedFeatures.length === 4 ? normalizedFeatures : prev.daftar_fitur,
        daftar_kegunaan:
          Array.isArray(incoming.daftar_kegunaan) && incoming.daftar_kegunaan.length > 0
            ? incoming.daftar_kegunaan.slice(0, 8)
            : prev.daftar_kegunaan,
        rasio_aspek: prev.rasio_aspek,
      }));
      setActivePresetId("custom");
    } catch (err) {
      setAutoFillError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat menghubungi AI."
      );
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleGeneratePoster = async () => {
    setActiveStudioView("render");
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const response = await fetch("/api/ai/generate-poster", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compiledPrompt,
          aspectRatio: variables.rasio_aspek,
          qualityMode,
          useReferenceLayout,
          logoImageDataUrl: variables.logo_image_url,
        }),
      });

      const data = (await response.json()) as {
        imageDataUrl?: string;
        modelUsed?: string;
        error?: string;
      };

      if (!response.ok || !data.imageDataUrl) {
        throw new Error(data.error || "Gagal merender gambar poster.");
      }

      const item: GeneratedRenderItem = {
        id: String(Date.now()),
        productTitle: `${variables.judul_produk} ${variables.sorotan_judul}`.trim(),
        brandName: variables.nama_brand,
        imageDataUrl: data.imageDataUrl,
        compiledPrompt,
        modelUsed: data.modelUsed || "gemini-3.1-flash-lite-image",
        aspectRatio: variables.rasio_aspek,
        createdAt: new Date().toISOString(),
      };

      setCurrentRender(item);
      setRenderHistory((prev) => [item, ...prev].slice(0, 9));
    } catch (err) {
      setGenerateError(
        err instanceof Error ? err.message : "Terjadi kesalahan saat generate gambar."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="top" className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <TopBar
        activeView={activeStudioView}
        onSelectView={setActiveStudioView}
        onFocusEditor={() => {
          document.getElementById("editor-variabel")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
        onGeneratePoster={handleGeneratePoster}
        isGenerating={isGenerating}
      />

      <main className="mx-auto max-w-[1440px] px-4 sm:px-6 py-6 space-y-6">
        {/* Compact Studio Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="space-y-1 max-w-2xl">
            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B2447] text-balance">
              Studio Master Prompt Poster Produk Dinamis
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ubah produk, varian ukuran bertingkat, ikon fitur, dan palet warna melalui variabel{" "}
              <code className="font-mono text-xs text-[#C2410C]">{"{{placeholder}}"}</code>{" "}
              untuk menghasilkan prompt Bahasa Indonesia dan poster katalog AI yang konsisten.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>Bahasa: Indonesia</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{variables.varian_ukuran.length} Varian Ukuran</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">Rasio {variables.rasio_aspek}</span>
          </div>
        </div>

        {/* 2-Column Workspace Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5">
            <VariableConfigurator
              variables={variables}
              activeTab={activeEditorTab}
              activePresetId={activePresetId}
              highlightedField={highlightedField}
              onTabChange={setActiveEditorTab}
              onChange={handleVariablesChange}
              onSelectPreset={handleSelectPreset}
              onAutoFill={handleAutoFill}
              isAutoFilling={isAutoFilling}
              autoFillError={autoFillError}
            />
          </div>

          <div className="lg:col-span-7 space-y-4">
            {/* Workspace Output Mode Switcher */}
            <div
              role="tablist"
              aria-label="Mode Tampilan Studio"
              className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-white p-1"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeStudioView === "template"}
                onClick={() => setActiveStudioView("template")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeStudioView === "template"
                    ? "bg-[#0B2447] text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Master Prompt {"{{...}}"}
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeStudioView === "compiled"}
                onClick={() => setActiveStudioView("compiled")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeStudioView === "compiled"
                    ? "bg-[#0B2447] text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Blueprint &amp; Prompt Final
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeStudioView === "render"}
                onClick={() => setActiveStudioView("render")}
                className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  activeStudioView === "render"
                    ? "bg-[#EA580C] text-white font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Generate Gambar AI
              </button>
            </div>

            {activeStudioView === "template" && (
              <MasterPromptPanel
                variables={variables}
                onJumpToVariable={handleJumpToVariable}
              />
            )}

            {activeStudioView === "compiled" && (
              <BlueprintPreview
                variables={variables}
                onGenerateAI={handleGeneratePoster}
              />
            )}

            {activeStudioView === "render" && (
              <AiRenderPanel
                variables={variables}
                compiledPrompt={compiledPrompt}
                qualityMode={qualityMode}
                useReferenceLayout={useReferenceLayout}
                isGenerating={isGenerating}
                errorMessage={generateError}
                currentRender={currentRender}
                history={renderHistory}
                onQualityChange={setQualityMode}
                onReferenceToggle={setUseReferenceLayout}
                onGenerate={handleGeneratePoster}
                onSelectHistory={setCurrentRender}
                onClearHistory={() => {
                  setRenderHistory([]);
                  setCurrentRender(null);
                }}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
