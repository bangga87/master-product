import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  Droplets,
  Eye,
  Layers,
  Leaf,
  Package,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import { compileMasterPrompt } from "../data/masterPrompt";
import type { FeatureIconKey, PosterVariables } from "../types/poster";

interface BlueprintPreviewProps {
  variables: PosterVariables;
  onGenerateAI: () => void;
}

function renderFeatureIcon(key: FeatureIconKey, color: string) {
  const props = { className: "h-6 w-6", style: { color }, strokeWidth: 1.75 };
  switch (key) {
    case "package":
      return <ShoppingBag {...props} />;
    case "leaf":
      return <Leaf {...props} />;
    case "shield-bolt":
      return <ShieldAlert {...props} />;
    case "shield-check":
      return <ShieldCheck {...props} />;
    case "droplet":
      return <Droplets {...props} />;
    case "sparkles":
      return <Sparkles {...props} />;
    case "layers":
      return <Layers {...props} />;
    case "truck":
      return <Truck {...props} />;
  }
}

function splitBrandHighlight(brand: string, highlight: string): [string, string] {
  if (!highlight.trim()) return [brand, ""];
  const upperBrand = brand;
  const idx = upperBrand.toLowerCase().lastIndexOf(highlight.toLowerCase());
  if (idx === -1) return [brand, ""];
  return [brand.slice(0, idx), brand.slice(idx)];
}

export function BlueprintPreview({
  variables,
  onGenerateAI,
}: BlueprintPreviewProps) {
  const [showReference, setShowReference] = useState(false);
  const [refBroken, setRefBroken] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const compiledPrompt = compileMasterPrompt(variables);
  const [brandPrefix, brandSuffix] = splitBrandHighlight(
    variables.nama_brand,
    variables.sorotan_brand
  );

  const handleCopyCompiled = async () => {
    await navigator.clipboard.writeText(compiledPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 1800);
  };

  const handleDownloadBlueprintPng = async () => {
    const size = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, size);
    bgGrad.addColorStop(0, variables.warna_latar || "#F8FAFC");
    bgGrad.addColorStop(0.76, "#FFFFFF");
    bgGrad.addColorStop(0.77, "#E2E8F0");
    bgGrad.addColorStop(1, "#FFFFFF");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, size, size);

    // Brand Mark (Uploaded Logo or Default Vector+Text)
    const fullBrand = variables.nama_brand.toUpperCase();
    const prefix = brandPrefix.toUpperCase();
    const suffix = brandSuffix.toUpperCase();

    if (variables.logo_image_url) {
      try {
        const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = variables.logo_image_url!;
        });
        const maxW = 280;
        const maxH = variables.tampilkan_teks_dengan_logo ? 68 : 96;
        const scale = Math.min(maxW / logoImg.width, maxH / logoImg.height);
        const drawW = logoImg.width * scale;
        const drawH = logoImg.height * scale;
        const logoY = variables.tampilkan_teks_dengan_logo ? 28 : 34 + (maxH - drawH) / 2;
        ctx.drawImage(logoImg, size / 2 - drawW / 2, logoY, drawW, drawH);

        if (variables.tampilkan_teks_dengan_logo) {
          ctx.font = "800 24px 'Plus Jakarta Sans', sans-serif";
          const totalW = ctx.measureText(fullBrand).width;
          const prefixW = ctx.measureText(prefix).width;
          const startX = size / 2 - totalW / 2;
          ctx.textAlign = "left";
          ctx.fillStyle = variables.warna_primer;
          ctx.fillText(prefix, startX, 126);
          if (suffix) {
            ctx.fillStyle = variables.warna_aksen;
            ctx.fillText(suffix, startX + prefixW, 126);
          }
        }
      } catch {
        // Fallback to text wordmark if image fails
      }
    } else {
      ctx.font = "800 34px 'Plus Jakarta Sans', sans-serif";
      const totalW = ctx.measureText(fullBrand).width;
      const prefixW = ctx.measureText(prefix).width;
      const startX = size / 2 - totalW / 2;

      ctx.textAlign = "left";
      ctx.fillStyle = variables.warna_primer;
      ctx.fillText(prefix, startX, 108);
      if (suffix) {
        ctx.fillStyle = variables.warna_aksen;
        ctx.fillText(suffix, startX + prefixW, 108);
      }

      // Shopping bag outline arc above brand
      ctx.strokeStyle = variables.warna_primer;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(size / 2, 62, 22, Math.PI, 0);
      ctx.stroke();
    }

    // Main Headline
    ctx.font = "800 48px 'Plus Jakarta Sans', sans-serif";
    const mainText = `${variables.judul_produk.toUpperCase()} `;
    const accentText = variables.sorotan_judul.toUpperCase();
    const mainW = ctx.measureText(mainText).width;
    const accentW = ctx.measureText(accentText).width;
    const titleStart = size / 2 - (mainW + accentW) / 2;

    ctx.fillStyle = variables.warna_primer;
    ctx.fillText(mainText, titleStart, 200);
    ctx.fillStyle = variables.warna_aksen;
    ctx.fillText(accentText, titleStart + mainW, 200);

    // Tagline
    ctx.textAlign = "center";
    ctx.font = "600 26px 'DM Sans', sans-serif";
    ctx.fillStyle = variables.warna_primer;
    ctx.fillText(variables.tagline_3_poin, size / 2, 255);

    // Variants staircase
    const count = variables.varian_ukuran.length;
    const stageLeft = 64;
    const stageWidth = size - 128;
    const gap = 22;
    const boxW = (stageWidth - gap * (count - 1)) / count;
    const floorY = 790;
    const maxBoxH = 340;

    variables.varian_ukuran.forEach((v, idx) => {
      const x = stageLeft + idx * (boxW + gap);
      const h = (v.skala_tinggi / 100) * maxBoxH;
      const y = floorY - h;

      // Floating pill badge above pack
      const pillW = Math.min(boxW + 10, 172);
      const pillH = 62;
      const pillX = x + (boxW - pillW) / 2;
      const pillY = y - pillH - 18;
      const r = 28;

      ctx.fillStyle = variables.warna_aksen;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, r);
      ctx.fill();

      ctx.fillStyle = "#FFFFFF";
      ctx.textAlign = "center";
      ctx.font = "700 18px 'DM Sans', sans-serif";
      ctx.fillText(v.label_ukuran, pillX + pillW / 2, pillY + 26);
      ctx.font = "500 16px 'DM Sans', sans-serif";
      ctx.fillText(
        v.label_kapasitas ? `(${v.label_kapasitas})` : "",
        pillX + pillW / 2,
        pillY + 48
      );

      // Floor reflection
      const reflGrad = ctx.createLinearGradient(0, floorY, 0, floorY + 95);
      reflGrad.addColorStop(0, "rgba(15, 23, 42, 0.08)");
      reflGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = reflGrad;
      ctx.fillRect(x, floorY + 2, boxW, 95);

      // Packaging silhouette box
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = "#CBD5E1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x, y, boxW, h, 8);
      ctx.fill();
      ctx.stroke();

      // Inner brand strip on pack
      ctx.fillStyle = variables.warna_primer;
      ctx.fillRect(x + boxW * 0.24, y + h * 0.16, boxW * 0.52, h * 0.68);
      ctx.fillStyle = variables.warna_aksen;
      ctx.fillRect(x + boxW * 0.34, y + h * 0.28, boxW * 0.14, h * 0.44);
    });

    // Bottom Left 4 Features
    const featAreaW = 560;
    const featStep = featAreaW / 4;
    variables.daftar_fitur.slice(0, 4).forEach((f, idx) => {
      const cx = 64 + idx * featStep + featStep / 2;
      ctx.strokeStyle = variables.warna_aksen;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx - 22, 875, 44, 44, 10);
      ctx.stroke();

      ctx.fillStyle = variables.warna_primer;
      ctx.textAlign = "center";
      ctx.font = "700 16px 'DM Sans', sans-serif";
      ctx.fillText(f.label.slice(0, 18), cx, 952);
    });

    // Bottom Right Use-Case Card
    const cardX = 640;
    const cardY = 855;
    const cardW = 376;
    const cardH = 165;
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#E2E8F0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 20);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = variables.warna_primer;
    ctx.font = "700 22px 'Plus Jakarta Sans', sans-serif";
    ctx.fillText(variables.judul_kartu_kegunaan, cardX + 24, cardY + 40);

    ctx.font = "500 16px 'DM Sans', sans-serif";
    variables.daftar_kegunaan.slice(0, 6).forEach((item, i) => {
      const col = i < 3 ? 0 : 1;
      const row = i % 3;
      const ix = cardX + 24 + col * 170;
      const iy = cardY + 76 + row * 30;
      ctx.fillStyle = variables.warna_aksen;
      ctx.fillText("✓", ix, iy);
      ctx.fillStyle = "#334155";
      ctx.fillText(item.slice(0, 16), ix + 20, iy);
    });

    // Corner circle badge
    const badgeCx = cardX + cardW - 22;
    const badgeCy = cardY + 10;
    ctx.fillStyle = variables.warna_aksen;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, 44, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.font = "700 14px 'DM Sans', sans-serif";
    const badgeWords = variables.teks_badge_sudut.split(" ");
    if (badgeWords.length >= 2) {
      ctx.fillText(badgeWords[0], badgeCx, badgeCy - 4);
      ctx.fillText(badgeWords.slice(1).join(" "), badgeCx, badgeCy + 14);
    } else {
      ctx.fillText(variables.teks_badge_sudut, badgeCx, badgeCy + 5);
    }

    const link = document.createElement("a");
    link.download = `blueprint-${variables.nama_brand.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="space-y-5">
      {/* Live Visual Blueprint */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="font-display text-base font-bold text-[#0B2447]">
              Blueprint Tata Letak Poster ({variables.rasio_aspek})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pratinjau komposisi dinamis sesuai variabel &amp; warna yang Anda atur.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowReference((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                showReference
                  ? "border-[#0B2447] bg-[#0B2447]/5 text-[#0B2447]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Eye className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{showReference ? "Tutup Referensi" : "Bandingkan Referensi"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadBlueprintPng}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Unduh Blueprint PNG</span>
            </button>
          </div>
        </div>

        <div
          className={`grid gap-4 ${
            showReference ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* Live HTML Blueprint Poster */}
          <div
            className="mx-auto w-full max-w-[540px] aspect-square rounded-lg border border-slate-200 overflow-hidden flex flex-col justify-between p-5 select-none"
            style={{
              background: `linear-gradient(180deg, ${variables.warna_latar} 0%, #FFFFFF 75%, #E2E8F0 76.5%, #FFFFFF 100%)`,
            }}
          >
            {/* Header Zone */}
            <div className="text-center space-y-1.5">
              {variables.logo_image_url ? (
                <div className="inline-flex flex-col items-center gap-0.5">
                  <img
                    src={variables.logo_image_url}
                    alt={`Logo ${variables.nama_brand}`}
                    className={`${
                      variables.tampilkan_teks_dengan_logo ? "h-8" : "h-11"
                    } w-auto max-w-[160px] object-contain mx-auto`}
                  />
                  {variables.tampilkan_teks_dengan_logo && (
                    <div className="font-display text-xs font-extrabold tracking-tight">
                      <span style={{ color: variables.warna_primer }}>
                        {brandPrefix}
                      </span>
                      {brandSuffix && (
                        <span style={{ color: variables.warna_aksen }}>
                          {brandSuffix}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="inline-flex flex-col items-center">
                  <div
                    className="h-3 w-7 rounded-t-full border-2 border-b-0 -mb-0.5"
                    style={{ borderColor: variables.warna_primer }}
                  />
                  <div className="font-display text-sm font-extrabold tracking-tight">
                    <span style={{ color: variables.warna_primer }}>
                      {brandPrefix}
                    </span>
                    {brandSuffix && (
                      <span style={{ color: variables.warna_aksen }}>
                        {brandSuffix}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <h3 className="font-display text-base sm:text-lg font-extrabold tracking-tight leading-tight uppercase">
                <span style={{ color: variables.warna_primer }}>
                  {variables.judul_produk}{" "}
                </span>
                <span style={{ color: variables.warna_aksen }}>
                  {variables.sorotan_judul}
                </span>
              </h3>

              <p
                className="text-[11px] font-semibold"
                style={{ color: variables.warna_primer }}
              >
                {variables.tagline_3_poin}
              </p>
            </div>

            {/* Product Lineup Stage */}
            <div className="flex-1 flex items-end justify-center gap-2 sm:gap-3 pt-6 pb-3 px-1">
              {variables.varian_ukuran.map((variant) => (
                <div
                  key={variant.id}
                  className="flex-1 flex flex-col items-center justify-end h-full min-w-0"
                >
                  {/* Floating Pill Badge */}
                  <div
                    className="rounded-full px-2 py-1 text-center text-white mb-2 max-w-full shadow-xs"
                    style={{ backgroundColor: variables.warna_aksen }}
                  >
                    <div className="text-[9px] sm:text-[10px] font-bold leading-tight truncate tabular-nums">
                      {variant.label_ukuran}
                    </div>
                    {variant.label_kapasitas && (
                      <div className="text-[8px] sm:text-[9px] opacity-95 leading-tight truncate">
                        ({variant.label_kapasitas})
                      </div>
                    )}
                  </div>

                  {/* Product Pack Representation */}
                  <div
                    className="w-full rounded-md border border-slate-300 bg-white/95 shadow-xs relative flex items-center justify-center overflow-hidden"
                    style={{ height: `${Math.max(40, variant.skala_tinggi * 0.56)}%` }}
                  >
                    <div
                      className="w-[46%] h-[72%] rounded-xs flex items-center justify-center"
                      style={{ backgroundColor: variables.warna_primer }}
                    >
                      <div
                        className="w-1.5 h-3/5 rounded-xs"
                        style={{ backgroundColor: variables.warna_aksen }}
                      />
                    </div>
                  </div>

                  {/* Soft Floor Reflection */}
                  <div
                    className="w-full h-4 rounded-b-md opacity-20 -mt-0.5"
                    style={{
                      background: `linear-gradient(180deg, ${variables.warna_primer}, transparent)`,
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Footer Split Zone */}
            <div className="grid grid-cols-12 gap-2.5 items-end pt-2">
              <div className="col-span-7 grid grid-cols-4 gap-1.5">
                {variables.daftar_fitur.slice(0, 4).map((fitur) => (
                  <div
                    key={fitur.id}
                    className="flex flex-col items-center text-center gap-1"
                  >
                    <div className="p-1">
                      {renderFeatureIcon(fitur.ikon_key, variables.warna_aksen)}
                    </div>
                    <span
                      className="text-[8.5px] sm:text-[9.5px] font-bold leading-tight line-clamp-2"
                      style={{ color: variables.warna_primer }}
                    >
                      {fitur.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="col-span-5 relative rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs">
                <div
                  className="absolute -top-3.5 -right-2 h-11 w-11 rounded-full flex items-center justify-center text-center text-[8px] font-bold leading-tight text-white p-1 shadow-xs"
                  style={{ backgroundColor: variables.warna_aksen }}
                >
                  {variables.teks_badge_sudut}
                </div>
                <div
                  className="text-[10px] font-bold mb-1"
                  style={{ color: variables.warna_primer }}
                >
                  {variables.judul_kartu_kegunaan}
                </div>
                <div className="grid grid-cols-2 gap-x-1.5 gap-y-0.5">
                  {variables.daftar_kegunaan.slice(0, 6).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 text-[8.5px] text-slate-700 truncate"
                    >
                      <span
                        className="font-bold shrink-0"
                        style={{ color: variables.warna_aksen }}
                      >
                        ✓
                      </span>
                      <span className="truncate">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Reference Poster Side-by-Side */}
          {showReference && (
            <div className="mx-auto w-full max-w-[540px] flex flex-col gap-2">
              <div className="aspect-square rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
                {!refBroken ? (
                  <img
                    src="/assets/aistudio/tictas_hd_0a8406a7.jpg"
                    alt="Referensi asli poster Kemasku Kantong Plastik Tic-Tas HD"
                    referrerPolicy="no-referrer"
                    onError={() => setRefBroken(true)}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <Package className="h-8 w-8 mb-2 text-slate-400" />
                    <span className="text-xs font-medium">
                      Gambar Referensi Poster Asli (Kemasku Tic-Tas HD)
                    </span>
                  </div>
                )}
              </div>
              <p className="text-center text-xs text-slate-500">
                Referensi Tata Letak Asli
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compiled Final Prompt Ready to Use */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-3.5">
          <div>
            <h3 className="font-display text-sm font-bold text-[#0B2447]">
              Prompt Final Terkompilasi (Bahasa Indonesia)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh placeholder telah diganti nilai produk aktif dan siap langsung dirender.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCompiled}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {copiedPrompt ? (
                <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copiedPrompt ? "Prompt Tersalin" : "Salin Prompt Final"}</span>
            </button>
            <button
              type="button"
              onClick={onGenerateAI}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#EA580C] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#C2410C] transition-colors cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Render dengan Gemini</span>
            </button>
          </div>
        </div>

        <pre className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 font-mono text-[12px] leading-relaxed text-slate-800 whitespace-pre-wrap overflow-x-auto max-h-[340px]">
          {compiledPrompt}
        </pre>
      </div>
    </div>
  );
}
