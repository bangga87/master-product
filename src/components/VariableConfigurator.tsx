import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Layers,
  Loader2,
  Palette,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  X,
  CheckSquare,
} from "lucide-react";
import { PRESET_TEMPLATES } from "../data/masterPrompt";
import type {
  AspectRatioOption,
  EditorTabId,
  FeatureIconKey,
  PosterVariables,
  ProductVariant,
} from "../types/poster";

interface VariableConfiguratorProps {
  variables: PosterVariables;
  activeTab: EditorTabId;
  activePresetId: string;
  highlightedField: string | null;
  onTabChange: (tab: EditorTabId) => void;
  onChange: (updated: PosterVariables) => void;
  onSelectPreset: (presetId: string) => void;
  onAutoFill: (productIdea: string) => Promise<void>;
  isAutoFilling: boolean;
  autoFillError: string | null;
}

const ICON_OPTIONS: Array<{ value: FeatureIconKey; label: string }> = [
  { value: "package", label: "Kemasan / Tas" },
  { value: "leaf", label: "Daun / Higienis" },
  { value: "shield-bolt", label: "Perisai Kuat" },
  { value: "shield-check", label: "Perisai Aman" },
  { value: "droplet", label: "Anti Bocor" },
  { value: "sparkles", label: "Bening / Premium" },
  { value: "layers", label: "Lapisan Tebal" },
  { value: "truck", label: "Siap Kirim" },
];

const ASPECT_OPTIONS: Array<{ value: AspectRatioOption; label: string }> = [
  { value: "1:1", label: "1:1 (Persegi Katalog)" },
  { value: "3:4", label: "3:4 (Poster Vertikal)" },
  { value: "4:3", label: "4:3 (Banner Mendatar)" },
  { value: "9:16", label: "9:16 (Story / Reels)" },
  { value: "16:9", label: "16:9 (Layar Lebar)" },
];

export function VariableConfigurator({
  variables,
  activeTab,
  activePresetId,
  highlightedField,
  onTabChange,
  onChange,
  onSelectPreset,
  onAutoFill,
  isAutoFilling,
  autoFillError,
}: VariableConfiguratorProps) {
  const [productIdea, setProductIdea] = useState("");
  const [newUseCase, setNewUseCase] = useState("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const updateField = <K extends keyof PosterVariables>(
    key: K,
    value: PosterVariables[K]
  ) => {
    onChange({ ...variables, [key]: value });
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setLogoError(null);
    if (!file.type.startsWith("image/")) {
      setLogoError("Format file harus berupa gambar (PNG, JPG, WebP, atau SVG).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLogoError("Ukuran file logo maksimal 5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      const img = new Image();
      img.onload = () => {
        const maxSide = 512;
        const scale = Math.min(1, maxSide / Math.max(img.width || maxSide, img.height || maxSide));
        const targetW = Math.max(1, Math.round((img.width || maxSide) * scale));
        const targetH = Math.max(1, Math.round((img.height || maxSide) * scale));

        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          updateField("logo_image_url", rawDataUrl);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        const normalizedPng = canvas.toDataURL("image/png");
        onChange({
          ...variables,
          logo_image_url: normalizedPng,
        });
      };
      img.onerror = () => {
        setLogoError("Gagal membaca gambar logo. Coba unggah file PNG atau JPG lain.");
      };
      img.src = rawDataUrl;
    };
    reader.onerror = () => {
      setLogoError("Gagal membaca file dari perangkat.");
    };
    reader.readAsDataURL(file);
  };

  const handleAutoFillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productIdea.trim() || isAutoFilling) return;
    await onAutoFill(productIdea.trim());
  };

  const updateVariant = (id: string, patch: Partial<ProductVariant>) => {
    onChange({
      ...variables,
      varian_ukuran: variables.varian_ukuran.map((v) =>
        v.id === id ? { ...v, ...patch } : v
      ),
    });
  };

  const addVariant = () => {
    if (variables.varian_ukuran.length >= 6) return;
    const nextIdx = variables.varian_ukuran.length + 1;
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      label_ukuran: `Ukuran ${nextIdx}`,
      label_kapasitas: "Baru",
      skala_tinggi: 95,
    };
    onChange({
      ...variables,
      varian_ukuran: [...variables.varian_ukuran, newVar],
    });
  };

  const removeVariant = (id: string) => {
    if (variables.varian_ukuran.length <= 2) return;
    onChange({
      ...variables,
      varian_ukuran: variables.varian_ukuran.filter((v) => v.id !== id),
    });
  };

  const moveVariant = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= variables.varian_ukuran.length) return;
    const copy = [...variables.varian_ukuran];
    const [item] = copy.splice(index, 1);
    copy.splice(target, 0, item);
    onChange({ ...variables, varian_ukuran: copy });
  };

  const addUseCase = () => {
    const trimmed = newUseCase.trim();
    if (!trimmed || variables.daftar_kegunaan.length >= 8) return;
    onChange({
      ...variables,
      daftar_kegunaan: [...variables.daftar_kegunaan, trimmed],
    });
    setNewUseCase("");
  };

  const removeUseCase = (idx: number) => {
    if (variables.daftar_kegunaan.length <= 1) return;
    onChange({
      ...variables,
      daftar_kegunaan: variables.daftar_kegunaan.filter((_, i) => i !== idx),
    });
  };

  const inputClass = (fieldKey: string) =>
    `w-full rounded-lg border px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/25 focus:border-[#EA580C] transition-colors ${
      highlightedField === fieldKey
        ? "border-[#EA580C] ring-2 ring-[#EA580C]/25"
        : "border-slate-200"
    }`;

  return (
    <section
      id="editor-variabel"
      className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5"
    >
      {/* AI Auto-Fill Section */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h2 className="font-display text-sm font-bold text-[#0B2447]">
            Ganti Produk Otomatis dengan AI
          </h2>
          <span className="text-xs text-slate-500">Gemini 4 Hydrogen</span>
        </div>
        <form onSubmit={handleAutoFillSubmit} className="flex gap-2">
          <input
            type="text"
            value={productIdea}
            onChange={(e) => setProductIdea(e.target.value)}
            placeholder="Ketik jenis barang, mis. Botol Sambal PET, Paper Bowl..."
            className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#EA580C]/25 focus:border-[#EA580C]"
          />
          <button
            type="submit"
            disabled={isAutoFilling || !productIdea.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B2447] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#153668] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {isAutoFilling ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{isAutoFilling ? "Mengisi..." : "Isi Variabel"}</span>
          </button>
        </form>
        {autoFillError && (
          <p className="mt-2 text-xs text-red-600" role="alert">
            {autoFillError}
          </p>
        )}
      </div>

      {/* Preset Selector */}
      <div className="border-b border-slate-100 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-600">
            Preset Contoh Produk
          </span>
          <button
            type="button"
            onClick={() => onSelectPreset("kemasku-tictas")}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-[#0B2447] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Reset Referensi Asli</span>
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {PRESET_TEMPLATES.map((preset) => {
            const active = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset.id)}
                className={`text-left rounded-lg border px-3 py-2 transition-colors cursor-pointer ${
                  active
                    ? "border-[#0B2447] bg-[#0B2447]/[0.04] text-[#0B2447]"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <div className="text-xs font-semibold truncate">{preset.nama}</div>
                <div className="text-[11px] text-slate-500 truncate">
                  {preset.kategori}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Tabs */}
      <div
        role="tablist"
        aria-label="Kategori Variabel"
        className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1"
      >
        {(
          [
            { id: "brand", label: "Produk", icon: Tag },
            { id: "variants", label: "Ukuran", icon: Layers },
            { id: "features", label: "Fitur", icon: CheckSquare },
            { id: "style", label: "Warna", icon: Palette },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(t.id)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-white text-[#0B2447] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "brand" && (
        <div className="space-y-4">
          {/* Upload Logo Brand */}
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#0B2447]">
                  Logo Brand (Upload Gambar)
                </div>
                <div className="text-[11px] text-slate-500">
                  PNG transparan, JPG, WebP, atau SVG (maks. 5 MB).
                </div>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{variables.logo_image_url ? "Ganti Logo" : "Upload Logo"}</span>
                </button>
                {variables.logo_image_url && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...variables,
                        logo_image_url: undefined,
                        tampilkan_teks_dengan_logo: false,
                      })
                    }
                    aria-label="Hapus logo"
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {variables.logo_image_url && (
              <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-white p-2.5">
                <div className="h-12 w-24 shrink-0 rounded border border-slate-100 bg-slate-50 flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src={variables.logo_image_url}
                    alt="Preview logo brand"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(variables.tampilkan_teks_dengan_logo)}
                    onChange={(e) =>
                      updateField("tampilkan_teks_dengan_logo", e.target.checked)
                    }
                    className="accent-[#EA580C]"
                  />
                  <span>Tampilkan teks nama brand di bawah logo</span>
                </label>
              </div>
            )}

            {logoError && (
              <p className="text-xs text-red-600" role="alert">
                {logoError}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="field-nama_brand"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nama Brand <code className="font-mono text-[11px] text-slate-400">{"{{nama_brand}}"}</code>
              </label>
              <input
                id="field-nama_brand"
                type="text"
                value={variables.nama_brand}
                onChange={(e) => updateField("nama_brand", e.target.value)}
                className={inputClass("nama_brand")}
              />
            </div>
            <div>
              <label
                htmlFor="field-sorotan_brand"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Sorotan
              </label>
              <input
                id="field-sorotan_brand"
                type="text"
                value={variables.sorotan_brand}
                onChange={(e) => updateField("sorotan_brand", e.target.value)}
                className={inputClass("sorotan_brand")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="field-deskripsi_logo"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Deskripsi Ikon Logo <code className="font-mono text-[11px] text-slate-400">{"{{deskripsi_logo}}"}</code>
            </label>
            <input
              id="field-deskripsi_logo"
              type="text"
              value={variables.deskripsi_logo}
              onChange={(e) => updateField("deskripsi_logo", e.target.value)}
              className={inputClass("deskripsi_logo")}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label
                htmlFor="field-judul_produk"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Judul Utama <code className="font-mono text-[11px] text-slate-400">{"{{judul_produk}}"}</code>
              </label>
              <input
                id="field-judul_produk"
                type="text"
                value={variables.judul_produk}
                onChange={(e) => updateField("judul_produk", e.target.value)}
                className={inputClass("judul_produk")}
              />
            </div>
            <div>
              <label
                htmlFor="field-sorotan_judul"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Kata Aksen
              </label>
              <input
                id="field-sorotan_judul"
                type="text"
                value={variables.sorotan_judul}
                onChange={(e) => updateField("sorotan_judul", e.target.value)}
                className={inputClass("sorotan_judul")}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="field-tagline_3_poin"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Sub-Judul 3 Poin <code className="font-mono text-[11px] text-slate-400">{"{{tagline_3_poin}}"}</code>
            </label>
            <input
              id="field-tagline_3_poin"
              type="text"
              value={variables.tagline_3_poin}
              onChange={(e) => updateField("tagline_3_poin", e.target.value)}
              className={inputClass("tagline_3_poin")}
            />
          </div>

          <div>
            <label
              htmlFor="field-jenis_produk"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Jenis Barang / Produk <code className="font-mono text-[11px] text-slate-400">{"{{jenis_produk}}"}</code>
            </label>
            <input
              id="field-jenis_produk"
              type="text"
              value={variables.jenis_produk}
              onChange={(e) => updateField("jenis_produk", e.target.value)}
              className={inputClass("jenis_produk")}
            />
          </div>

          <div>
            <label
              htmlFor="field-deskripsi_kemasan"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Detail Visual Kemasan &amp; Material <code className="font-mono text-[11px] text-slate-400">{"{{deskripsi_kemasan}}"}</code>
            </label>
            <textarea
              id="field-deskripsi_kemasan"
              rows={3}
              value={variables.deskripsi_kemasan}
              onChange={(e) => updateField("deskripsi_kemasan", e.target.value)}
              className={inputClass("deskripsi_kemasan")}
            />
          </div>
        </div>
      )}

      {activeTab === "variants" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-600">
              Atur urutan varian dari kiri (terkecil) ke kanan (terbesar).
            </p>
            <button
              type="button"
              onClick={addVariant}
              disabled={variables.varian_ukuran.length >= 6}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Tambah</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {variables.varian_ukuran.map((variant, index) => (
              <div
                key={variant.id}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0B2447] tabular-nums">
                    Varian {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveVariant(index, -1)}
                      disabled={index === 0}
                      aria-label="Geser naik"
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveVariant(index, 1)}
                      disabled={index === variables.varian_ukuran.length - 1}
                      aria-label="Geser turun"
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeVariant(variant.id)}
                      disabled={variables.varian_ukuran.length <= 2}
                      aria-label="Hapus varian"
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Dimensi / Ukuran
                    </label>
                    <input
                      type="text"
                      value={variant.label_ukuran}
                      onChange={(e) =>
                        updateVariant(variant.id, { label_ukuran: e.target.value })
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-mono tabular-nums text-slate-900 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Kapasitas / Isi
                    </label>
                    <input
                      type="text"
                      value={variant.label_kapasitas}
                      onChange={(e) =>
                        updateVariant(variant.id, {
                          label_kapasitas: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[11px] text-slate-500 whitespace-nowrap">
                    Skala Tinggi:
                  </label>
                  <input
                    type="range"
                    min={45}
                    max={100}
                    value={variant.skala_tinggi}
                    onChange={(e) =>
                      updateVariant(variant.id, {
                        skala_tinggi: Number(e.target.value),
                      })
                    }
                    className="flex-1 accent-[#EA580C]"
                  />
                  <span className="font-mono text-xs text-slate-700 tabular-nums w-10 text-right">
                    {variant.skala_tinggi}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "features" && (
        <div className="space-y-5">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold text-[#0B2447]">
              4 Ikon Keunggulan Bawah Kiri
            </h3>
            {variables.daftar_fitur.map((fitur, idx) => (
              <div
                key={fitur.id}
                className="grid grid-cols-12 gap-2 items-center"
              >
                <span className="col-span-1 font-mono text-xs text-slate-400 tabular-nums">
                  0{idx + 1}
                </span>
                <select
                  value={fitur.ikon_key}
                  onChange={(e) => {
                    const nextKey = e.target.value as FeatureIconKey;
                    const opt = ICON_OPTIONS.find((o) => o.value === nextKey);
                    const nextList = variables.daftar_fitur.map((item) =>
                      item.id === fitur.id
                        ? {
                            ...item,
                            ikon_key: nextKey,
                            ikon_deskripsi: `Ikon garis ${opt?.label.toLowerCase() ?? "produk"}`,
                          }
                        : item
                    );
                    updateField("daftar_fitur", nextList);
                  }}
                  className="col-span-5 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#EA580C]"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={fitur.label}
                  onChange={(e) => {
                    const nextList = variables.daftar_fitur.map((item) =>
                      item.id === fitur.id
                        ? { ...item, label: e.target.value }
                        : item
                    );
                    updateField("daftar_fitur", nextList);
                  }}
                  placeholder="Label fitur"
                  className="col-span-6 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="field-judul_kartu_kegunaan"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Judul Kartu Kegunaan
                </label>
                <input
                  id="field-judul_kartu_kegunaan"
                  type="text"
                  value={variables.judul_kartu_kegunaan}
                  onChange={(e) =>
                    updateField("judul_kartu_kegunaan", e.target.value)
                  }
                  className={inputClass("judul_kartu_kegunaan")}
                />
              </div>
              <div>
                <label
                  htmlFor="field-teks_badge_sudut"
                  className="block text-xs font-medium text-slate-700 mb-1"
                >
                  Badge Lingkaran Sudut
                </label>
                <input
                  id="field-teks_badge_sudut"
                  type="text"
                  value={variables.teks_badge_sudut}
                  onChange={(e) =>
                    updateField("teks_badge_sudut", e.target.value)
                  }
                  className={inputClass("teks_badge_sudut")}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Daftar Item Centang (maks. 8)
              </label>
              <div className="space-y-1.5">
                {variables.daftar_kegunaan.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const copy = [...variables.daftar_kegunaan];
                        copy[idx] = e.target.value;
                        updateField("daftar_kegunaan", copy);
                      }}
                      className="flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
                    />
                    <button
                      type="button"
                      onClick={() => removeUseCase(idx)}
                      disabled={variables.daftar_kegunaan.length <= 1}
                      aria-label="Hapus item"
                      className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={newUseCase}
                  onChange={(e) => setNewUseCase(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUseCase();
                    }
                  }}
                  placeholder="Tambah kegunaan baru..."
                  className="flex-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#EA580C]"
                />
                <button
                  type="button"
                  onClick={addUseCase}
                  disabled={!newUseCase.trim() || variables.daftar_kegunaan.length >= 8}
                  className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "style" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="field-nama_warna_primer"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nama Warna Primer
              </label>
              <input
                id="field-nama_warna_primer"
                type="text"
                value={variables.nama_warna_primer}
                onChange={(e) =>
                  updateField("nama_warna_primer", e.target.value)
                }
                className={inputClass("nama_warna_primer")}
              />
            </div>
            <div>
              <label
                htmlFor="field-warna_primer"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Hex Primer
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={variables.warna_primer}
                  onChange={(e) => updateField("warna_primer", e.target.value)}
                  className="h-9 w-10 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  id="field-warna_primer"
                  type="text"
                  value={variables.warna_primer}
                  onChange={(e) => updateField("warna_primer", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="field-nama_warna_aksen"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Nama Warna Aksen
              </label>
              <input
                id="field-nama_warna_aksen"
                type="text"
                value={variables.nama_warna_aksen}
                onChange={(e) =>
                  updateField("nama_warna_aksen", e.target.value)
                }
                className={inputClass("nama_warna_aksen")}
              />
            </div>
            <div>
              <label
                htmlFor="field-warna_aksen"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Hex Aksen
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={variables.warna_aksen}
                  onChange={(e) => updateField("warna_aksen", e.target.value)}
                  className="h-9 w-10 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  id="field-warna_aksen"
                  type="text"
                  value={variables.warna_aksen}
                  onChange={(e) => updateField("warna_aksen", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="field-deskripsi_latar"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Deskripsi Latar Studio
              </label>
              <input
                id="field-deskripsi_latar"
                type="text"
                value={variables.deskripsi_latar}
                onChange={(e) => updateField("deskripsi_latar", e.target.value)}
                className={inputClass("deskripsi_latar")}
              />
            </div>
            <div>
              <label
                htmlFor="field-warna_latar"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Hex Latar
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={variables.warna_latar}
                  onChange={(e) => updateField("warna_latar", e.target.value)}
                  className="h-9 w-10 rounded border border-slate-200 cursor-pointer"
                />
                <input
                  id="field-warna_latar"
                  type="text"
                  value={variables.warna_latar}
                  onChange={(e) => updateField("warna_latar", e.target.value)}
                  className="flex-1 min-w-0 rounded-lg border border-slate-200 px-2.5 py-2 font-mono text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="field-rasio_aspek"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Rasio Aspek Poster
            </label>
            <select
              id="field-rasio_aspek"
              value={variables.rasio_aspek}
              onChange={(e) =>
                updateField("rasio_aspek", e.target.value as AspectRatioOption)
              }
              className={inputClass("rasio_aspek")}
            >
              {ASPECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="field-gaya_pencahayaan"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Pencahayaan &amp; Sudut Kamera
            </label>
            <textarea
              id="field-gaya_pencahayaan"
              rows={3}
              value={variables.gaya_pencahayaan}
              onChange={(e) => updateField("gaya_pencahayaan", e.target.value)}
              className={inputClass("gaya_pencahayaan")}
            />
          </div>
        </div>
      )}
    </section>
  );
}
