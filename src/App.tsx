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
const SESSION_API_KEY = "kemasku_manual_gemini_api_key";

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

async function safeParseJson(response: Response): Promise<Record<string, any> | null> {
  const rawText = await response.text();
  if (!rawText) return null;
  try {
    return JSON.parse(rawText) as Record<string, any>;
  } catch {
    return null;
  }
}

export default function App() {
  const [variables, setVariables] = useState<PosterVariables>(loadInitialVariables);
  const [activePresetId, setActivePresetId] = useState<string>("kemasku-tictas");
  const [activeEditorTab, setActiveEditorTab] = useState<EditorTabId>("brand");
  const [activeStudioView, setActiveStudioView] = useState<StudioViewTab>("template");
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // State API Key manual (disimpan hanya selama tab/sesi aktif)
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem(SESSION_API_KEY) || ""
  );
  const [apiCheckStatus, setApiCheckStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [apiCheckMessage, setApiCheckMessage] = useState<string>("");

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

  const handleApiKeyChange = (value: string) => {
    const cleaned = value.trim();
    setApiKey(cleaned);
    setApiCheckStatus("idle");
    setApiCheckMessage("");
    try {
      if (cleaned) {
        sessionStorage.setItem(SESSION_API_KEY, cleaned);
      } else {
        sessionStorage.removeItem(SESSION_API_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const handleClearApiKey = () => {
    handleApiKeyChange("");
    setApiCheckMessage("API key dihapus dari sesi ini.");
  };

  const handleCheckApi = async () => {
    const key = apiKey.trim();
    if (!key) {
      setApiCheckStatus("invalid");
      setApiCheckMessage("Paste API key terlebih dahulu sebelum mengecek.");
      return;
    }

    setApiCheckStatus("checking");
    setApiCheckMessage("Mengecek koneksi API...");

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`
      );
      const data = await safeParseJson(response);

      if (!response.ok) {
        setApiCheckStatus("invalid");
        setApiCheckMessage(
          data?.error?.message || `API tidak valid (HTTP ${response.status}).`
        );
        return;
      }

      setApiCheckStatus("valid");
      setApiCheckMessage("API aktif dan terhubung ke Gemini.");
    } catch (err) {
      setApiCheckStatus("invalid");
      setApiCheckMessage(
        err instanceof Error ? err.message : "Gagal menghubungi server API."
      );
    }
  };

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
    const key = apiKey.trim();
    if (!key) {
      setAutoFillError("Silakan paste API key terlebih dahulu di kolom API di atas.");
      return;
    }

    setIsAutoFilling(true);
    setAutoFillError(null);

    try {
      const promptText = `Isi variabel poster produk dalam JSON valid berdasarkan ide produk berikut: "${productIdea}". Brand saat ini: "${variables.nama_brand}". Kembalikan HANYA objek JSON tanpa markdown.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        }
      );

      const data = await safeParseJson(response);
      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Gagal menghubungi AI (HTTP ${response.status}).`
        );
      }

      const rawCandidateText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      let incoming: Partial<PosterVariables> = {};
      if (rawCandidateText) {
        try {
          incoming = JSON.parse(rawCandidateText) as Partial<PosterVariables>;
        } catch {
          throw new Error("Respons AI bukan format JSON yang valid.");
        }
      }

      const normalizedVariants = (incoming.varian_ukuran ?? variables.varian_ukuran)
        .slice(0, 6)
        .map((v, idx) => ({
          id: `ai-var-${Date.now()}-${idx}`,
          label_ukuran: v.label_ukuran || `Ukuran ${idx + 1}`,
          label_kapasitas: v.label_kapasitas || "",
          skala_tinggi: Math.min(
            100,
            Math.max(45, Number(v.skala_tinggi) || 55 + idx * 10)
          ),
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
        err instanceof Error ? err.message : "Terjadi kesalahan saat mengisi otomatis."
      );
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleGeneratePoster = async () => {
    const key = apiKey.trim();
    if (!key) {
      setActiveStudioView("render");
      setGenerateError("Silakan paste API key terlebih dahulu di kolom API di atas.");
      return;
    }

    setActiveStudioView("render");
    setIsGenerating(true);
    setGenerateError(null);

    try {
      // Gunakan model Gemini multimodal yang mendukung output gambar via generateContent
      const modelName =
        qualityMode === "hd"
          ? "gemini-3.1-flash-image-preview"
          : "gemini-2.5-flash-image";

      const parts: Array<Record<string, any>> = [
        {
          text: `${compiledPrompt}\n\nInstruksi tambahan: Rasio aspek ${
            variables.rasio_aspek || "1:1"
          }, mode kualitas ${qualityMode}, kunci tata letak referensi: ${
            useReferenceLayout ? "aktif" : "nonaktif"
          }.`,
        },
      ];

      // Jika ada logo yang diunggah (data URL), sertakan sebagai inlineData
      if (
        variables.logo_image_url &&
        variables.logo_image_url.startsWith("data:")
      ) {
        const match = variables.logo_image_url.match(
          /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/
        );
        if (match?.[1] && match?.[2]) {
          parts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              responseModalities: ["IMAGE"],
            },
          }),
        }
      );

      const data = await safeParseJson(response);
      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Gagal merender gambar poster (HTTP ${response.status}).`
        );
      }

      const responseParts: Array<Record<string, any>> =
        data?.candidates?.[0]?.content?.parts || [];
      const imagePart = responseParts.find(
        (p) => p?.inlineData?.data && typeof p.inlineData.data === "string"
      );

      if (!imagePart?.inlineData?.data) {
        throw new Error(
          "Respons API tidak menyertakan gambar. Pastikan model mendukung output gambar untuk API key Anda."
        );
      }

      const mimeType = imagePart.inlineData.mimeType || "image/png";
      const imageDataUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

      const item: GeneratedRenderItem = {
        id: String(Date.now()),
        productTitle: `${variables.judul_produk} ${variables.sorotan_judul}`.trim(),
        brandName: variables.nama_brand,
        imageDataUrl,
        compiledPrompt,
        modelUsed: modelName,
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

      const data = await safeParseJson(response);
      if (!response.ok) {
        throw new Error(
          data?.error?.message || `Gagal merender gambar poster (HTTP ${response.status}).`
        );
      }

      const base64Image = data?.predictions?.[0]?.bytesBase64Encoded;
      const mimeType = data?.predictions?.[0]?.mimeType || "image/png";
      if (!base64Image) {
        throw new Error("Respons API tidak menyertakan data gambar.");
      }

      const imageDataUrl = `data:${mimeType};base64,${base64Image}`;
      const item: GeneratedRenderItem = {
        id: String(Date.now()),
        productTitle: `${variables.judul_produk} ${variables.sorotan_judul}`.trim(),
        brandName: variables.nama_brand,
        imageDataUrl,
        compiledPrompt,
        modelUsed: modelName,
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

        {/* Panel Paste API Manual + Cek API */}
        <section
          aria-label="Pengaturan API Key Manual"
          className="rounded-xl border border-slate-200 bg-white p-4 space-y-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-[#0B2447]">
                API Key Gemini (Paste Manual)
              </h2>
              <p className="text-xs text-slate-500">
                Hanya disimpan di sesi browser ini (terhapus saat tab ditutup).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                placeholder="Paste API key di sini..."
                autoComplete="off"
                className="w-full sm:w-72 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-[#0B2447] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCheckApi}
                disabled={apiCheckStatus === "checking"}
                className="rounded-lg bg-[#0B2447] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#13386B] disabled:opacity-50 cursor-pointer"
              >
                {apiCheckStatus === "checking" ? "Mengecek..." : "Cek API"}
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={handleClearApiKey}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Hapus
                </button>
              )}
            </div>
          </div>

          {apiCheckMessage && (
            <p
              className={`text-xs ${
                apiCheckStatus === "valid"
                  ? "text-emerald-700"
                  : apiCheckStatus === "invalid"
                  ? "text-rose-600"
                  : "text-slate-600"
              }`}
            >
              {apiCheckMessage}
            </p>
          )}
        </section>

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
