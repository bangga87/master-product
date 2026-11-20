import "dotenv/config";
import express from "express";
import fs from "fs";
import path from "path";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const PORT = 3000;
const app = express();

app.use(express.json({ limit: "10mb" }));

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum dikonfigurasi pada server.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

function parseGeminiError(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  const lower = raw.toLowerCase();

  if (lower.includes("403") || lower.includes("permission_denied")) {
    return {
      status: 403,
      message:
        "Akses API ditolak (403). Periksa API key Anda di panel Settings > Secrets.",
    };
  }
  if (lower.includes("400") || lower.includes("api_key_invalid")) {
    return {
      status: 400,
      message:
        "API key tidak valid atau permintaan bermasalah (400). Periksa panel Settings > Secrets.",
    };
  }
  if (lower.includes("429") || lower.includes("resource_exhausted")) {
    return {
      status: 429,
      message:
        "Kuota API habis atau model ini membutuhkan API key berbayar (429). Pilih API key dengan billing aktif di panel Settings > Secrets.",
    };
  }
  if (lower.includes("404") || lower.includes("not_found")) {
    return {
      status: 404,
      message: "Model AI tidak ditemukan (404). Pastikan nama model sesuai konfigurasi terbaru.",
    };
  }
  return {
    status: 500,
    message: raw || "Terjadi kesalahan saat menghubungi layanan Gemini AI.",
  };
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/ai/autofill", async (req, res) => {
  try {
    const { productIdea, currentBrand } = req.body as {
      productIdea?: string;
      currentBrand?: string;
    };

    if (!productIdea || !productIdea.trim()) {
      res.status(400).json({ error: "Nama atau deskripsi produk wajib diisi." });
      return;
    }

    const ai = getGeminiClient();

    const prompt = `Buatkan set lengkap variabel placeholder Bahasa Indonesia untuk poster katalog produk bertingkat (mengikuti gaya poster produk dengan 4-5 ukuran berjajar dari kecil ke besar di lantai studio putih reflektif, headline kapital, 3 poin tagline, 4 ikon keunggulan di kiri bawah, dan kartu 'Cocok untuk:' dengan badge sudut di kanan bawah).

Produk yang diminta pengguna: "${productIdea.trim()}"
${currentBrand ? `Preferensi nama brand (boleh dipakai atau disesuaikan): "${currentBrand.trim()}"` : ""}

Ketentuan wajib:
- Seluruh teks harus dalam Bahasa Indonesia yang alami, ringkas, dan menarik untuk katalog marketplace/UMKM.
- Buat 4 sampai 5 varian ukuran berurutan dari terkecil ke terbesar, dengan skala_tinggi bertingkat (misal 52, 64, 76, 88, 100).
- Pilih ikon_key hanya dari daftar: "package", "leaf", "shield-bolt", "shield-check", "droplet", "sparkles", "layers", "truck".
- Berikan warna_primer (warna gelap kontras tinggi seperti navy, charcoal, espresso, forest green dalam format hex #RRGGBB) dan warna_aksen (warna cerah kontras tinggi dalam format hex #RRGGBB).
- "sorotan_brand" harus berupa 2-4 huruf akhiran dari "nama_brand" (contoh: jika nama_brand KEMASKU maka sorotan_brand adalah KU).`;

    const response = await ai.models.generateContent({
      model: "gemini-4-hydrogen",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            nama_brand: { type: Type.STRING },
            sorotan_brand: { type: Type.STRING },
            deskripsi_logo: { type: Type.STRING },
            judul_produk: { type: Type.STRING },
            sorotan_judul: { type: Type.STRING },
            tagline_3_poin: { type: Type.STRING },
            jenis_produk: { type: Type.STRING },
            deskripsi_kemasan: { type: Type.STRING },
            varian_ukuran: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label_ukuran: { type: Type.STRING },
                  label_kapasitas: { type: Type.STRING },
                  skala_tinggi: { type: Type.INTEGER },
                },
                required: ["label_ukuran", "label_kapasitas", "skala_tinggi"],
              },
            },
            daftar_fitur: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ikon_key: { type: Type.STRING },
                  ikon_deskripsi: { type: Type.STRING },
                  label: { type: Type.STRING },
                },
                required: ["ikon_key", "ikon_deskripsi", "label"],
              },
            },
            judul_kartu_kegunaan: { type: Type.STRING },
            daftar_kegunaan: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            teks_badge_sudut: { type: Type.STRING },
            nama_warna_primer: { type: Type.STRING },
            warna_primer: { type: Type.STRING },
            nama_warna_aksen: { type: Type.STRING },
            warna_aksen: { type: Type.STRING },
            deskripsi_latar: { type: Type.STRING },
            warna_latar: { type: Type.STRING },
            gaya_pencahayaan: { type: Type.STRING },
          },
          required: [
            "nama_brand",
            "sorotan_brand",
            "deskripsi_logo",
            "judul_produk",
            "sorotan_judul",
            "tagline_3_poin",
            "jenis_produk",
            "deskripsi_kemasan",
            "varian_ukuran",
            "daftar_fitur",
            "judul_kartu_kegunaan",
            "daftar_kegunaan",
            "teks_badge_sudut",
            "nama_warna_primer",
            "warna_primer",
            "nama_warna_aksen",
            "warna_aksen",
            "deskripsi_latar",
            "warna_latar",
            "gaya_pencahayaan",
          ],
        },
      },
    });

    const rawText = (response.text ?? "{}").trim();
    const parsed = JSON.parse(rawText);

    res.json({ variables: parsed });
  } catch (err) {
    const { status, message } = parseGeminiError(err);
    res.status(status).json({ error: message });
  }
});

app.post("/api/ai/generate-poster", async (req, res) => {
  try {
    const {
      compiledPrompt,
      aspectRatio = "1:1",
      qualityMode = "standard",
      useReferenceLayout = true,
      logoImageDataUrl,
    } = req.body as {
      compiledPrompt?: string;
      aspectRatio?: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
      qualityMode?: "standard" | "hd";
      useReferenceLayout?: boolean;
      logoImageDataUrl?: string;
    };

    if (!compiledPrompt || !compiledPrompt.trim()) {
      res.status(400).json({ error: "Prompt tidak boleh kosong." });
      return;
    }

    const ai = getGeminiClient();
    const modelName =
      qualityMode === "hd" ? "gemini-nano-banana-2.1" : "gemini-3.1-flash-lite-image";

    const parts: Array<
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    > = [];

    const refImagePath = path.resolve(
      process.cwd(),
      "public",
      "assets",
      "aistudio",
      "tictas_hd_0a8406a7.jpg"
    );

    const logoMatch = logoImageDataUrl?.match(
      /^data:(image\/(?:png|jpeg|webp));base64,(.+)$/
    );

    if (useReferenceLayout && fs.existsSync(refImagePath)) {
      const imageBytes = fs.readFileSync(refImagePath);
      parts.push({
        inlineData: {
          data: imageBytes.toString("base64"),
          mimeType: "image/jpeg",
        },
      });
    }

    if (logoMatch) {
      parts.push({
        inlineData: {
          mimeType: logoMatch[1],
          data: logoMatch[2],
        },
      });
    }

    const instructionPrefixParts: string[] = [];
    if (useReferenceLayout && fs.existsSync(refImagePath)) {
      instructionPrefixParts.push(
        "Gunakan gambar referensi pertama HANYA sebagai acuan struktur tata letak (posisi logo atas, headline besar, sub-judul, barisan produk bertingkat dengan badge kapsul ukuran di atasnya, pantulan lantai studio, 4 ikon fitur di kiri bawah, dan kartu 'Cocok untuk' + badge lingkaran di kanan bawah). Ganti sepenuhnya produk, merek, warna, dan seluruh teks."
      );
    }
    if (logoMatch) {
      instructionPrefixParts.push(
        "Gunakan gambar logo terlampir secara persis sebagai logo merek utama di bagian paling atas tengah poster dengan proporsi rapi dan latar bersih."
      );
    }

    const finalText =
      instructionPrefixParts.length > 0
        ? `${instructionPrefixParts.join(" ")}\n\n${compiledPrompt}`
        : compiledPrompt;

    parts.push({ text: finalText });

    const imageConfig: { aspectRatio: string; imageSize?: string } = {
      aspectRatio,
    };
    if (qualityMode === "hd") {
      imageConfig.imageSize = "2K";
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: {
        imageConfig,
      },
    });

    let imageDataUrl = "";
    let noteText = "";

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        const mime = part.inlineData.mimeType ?? "image/png";
        imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        break;
      } else if (part.text) {
        noteText += part.text;
      }
    }

    if (!imageDataUrl) {
      res.status(502).json({
        error:
          noteText ||
          "Model AI tidak mengembalikan data gambar. Coba sesuaikan deskripsi prompt Anda.",
      });
      return;
    }

    res.json({
      imageDataUrl,
      modelUsed: modelName,
    });
  } catch (err) {
    const { status, message } = parseGeminiError(err);
    res.status(status).json({ error: message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
