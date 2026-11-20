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
      if (
