export type AspectRatioOption = "1:1" | "3:4" | "4:3" | "16:9" | "9:16";

export type EditorTabId = "brand" | "variants" | "features" | "style";

export type StudioViewTab = "template" | "compiled" | "render";

export type FeatureIconKey =
  | "package"
  | "leaf"
  | "shield-bolt"
  | "shield-check"
  | "droplet"
  | "sparkles"
  | "layers"
  | "truck";

export interface ProductVariant {
  id: string;
  label_ukuran: string;
  label_kapasitas: string;
  skala_tinggi: number; // 45 to 100 (%)
}

export interface FeatureItem {
  id: string;
  ikon_key: FeatureIconKey;
  ikon_deskripsi: string;
  label: string;
}

export interface PosterVariables {
  nama_brand: string;
  sorotan_brand: string;
  deskripsi_logo: string;
  logo_image_url?: string;
  tampilkan_teks_dengan_logo?: boolean;
  judul_produk: string;
  sorotan_judul: string;
  tagline_3_poin: string;
  jenis_produk: string;
  deskripsi_kemasan: string;
  varian_ukuran: ProductVariant[];
  daftar_fitur: FeatureItem[];
  judul_kartu_kegunaan: string;
  daftar_kegunaan: string[];
  teks_badge_sudut: string;
  nama_warna_primer: string;
  warna_primer: string;
  nama_warna_aksen: string;
  warna_aksen: string;
  deskripsi_latar: string;
  warna_latar: string;
  gaya_pencahayaan: string;
  rasio_aspek: AspectRatioOption;
}

export interface PresetTemplate {
  id: string;
  nama: string;
  kategori: string;
  ringkasan: string;
  variables: PosterVariables;
}

export interface GeneratedRenderItem {
  id: string;
  productTitle: string;
  brandName: string;
  imageDataUrl: string;
  compiledPrompt: string;
  modelUsed: string;
  aspectRatio: AspectRatioOption;
  createdAt: string;
}
