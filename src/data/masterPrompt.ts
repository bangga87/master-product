import type { EditorTabId, PosterVariables, PresetTemplate } from "../types/poster";

export const MASTER_PROMPT_TEMPLATE = `Buat poster katalog produk komersial bergaya minimalis modern dengan rasio aspek {{rasio_aspek}} di atas latar belakang {{deskripsi_latar}} ({{warna_latar}}) yang memiliki lantai studio putih bersih dengan pantulan cermin lembut vertikal tepat di bawah setiap produk.

1. ZONA HEADER ATAS (RATA TENGAH):
- Paling atas tengah: Logo brand minimalis berupa {{deskripsi_logo}} bertuliskan "{{nama_brand}}" dengan gaya huruf sans-serif tebal geometris, berwarna {{nama_warna_primer}} ({{warna_primer}}) dan sorotan huruf "{{sorotan_brand}}" berwarna {{nama_warna_aksen}} ({{warna_aksen}}).
- Judul Utama (1 baris besar, huruf kapital tebal dan tajam): "{{judul_produk}} {{sorotan_judul}}", di mana kata "{{judul_produk}}" berwarna {{nama_warna_primer}} ({{warna_primer}}) dan kata penegas "{{sorotan_judul}}" berwarna {{nama_warna_aksen}} ({{warna_aksen}}).
- Sub-judul Tagline (font sans-serif semi-tebal warna {{nama_warna_primer}}): "{{tagline_3_poin}}".

2. ZONA PRODUK UTAMA (KOMPOSISI TANGGA BERTINGKAT):
- Tampilkan {{jumlah_varian}} varian produk {{jenis_produk}} yang berjajar rapi sejajar horizontal dari kiri ke kanan dalam urutan ukuran bertingkat (paling kecil di kiri hingga paling besar di kanan), berdiri tegak dan menempel di lantai studio dengan bayangan kontak halus serta refleksi tipis di permukaan lantai.
- Detail visual setiap unit produk: {{deskripsi_kemasan}}.
- Di atas setiap unit produk, melayang tepat di tengah, pasang badge berbentuk kapsul membulat (pill) berwarna solid {{nama_warna_aksen}} ({{warna_aksen}}) dengan teks putih tebal rata tengah dua baris (ukuran di atas, kapasitas/isi di bawah):
{{daftar_varian_ukuran}}

3. ZONA FOOTER BAWAH (TERBAGI DUA SISI SEIMBANG):
- SISI KIRI (4 IKON KEUNGGULAN): Susun 4 ikon garis tipis (outline vector) berwarna {{nama_warna_aksen}} ({{warna_aksen}}) secara horizontal dengan jarak merata, masing-masing disertai label teks tebal singkat berwarna {{nama_warna_primer}} di bawahnya:
{{daftar_fitur_bawah}}
- SISI KANAN (KARTU KEGUNAAN & BADGE SUDUT): Sebuah kartu persegi panjang bersudut membulat warna putih bersih dengan bayangan lembut bertajuk "{{judul_kartu_kegunaan}}" dalam warna {{nama_warna_primer}}. Di dalamnya terdapat daftar 2 kolom dengan tanda centang (✓) berwarna {{nama_warna_aksen}} berisi:
{{daftar_kegunaan_format}}
- Di pojok kanan atas kartu kegunaan tersebut, tempelkan badge lingkaran solid berwarna {{nama_warna_aksen}} ({{warna_aksen}}) bertuliskan teks putih dua baris rata tengah: "{{teks_badge_sudut}}".

4. PENCAHAYAAN, KAMERA & KUALITAS RENDER:
- {{gaya_pencahayaan}}.
- Seluruh teks pada poster harus tajam, sangat terbaca, ejaan Bahasa Indonesia akurat, komposisi simetris rapi tanpa elemen bertumpuk yang berantakan, kualitas fotografi produk komersial 8K yang siap unggah untuk katalog marketplace dan media sosial.`;

export interface VariableDefinition {
  key: string;
  label: string;
  tab: EditorTabId;
  inputId?: string;
}

export const VARIABLE_DEFINITIONS: VariableDefinition[] = [
  { key: "rasio_aspek", label: "Rasio Aspek", tab: "style", inputId: "field-rasio_aspek" },
  { key: "deskripsi_latar", label: "Deskripsi Latar", tab: "style", inputId: "field-deskripsi_latar" },
  { key: "warna_latar", label: "Kode Warna Latar", tab: "style", inputId: "field-warna_latar" },
  { key: "deskripsi_logo", label: "Deskripsi Ikon Logo", tab: "brand", inputId: "field-deskripsi_logo" },
  { key: "nama_brand", label: "Nama Brand", tab: "brand", inputId: "field-nama_brand" },
  { key: "sorotan_brand", label: "Sorotan Teks Brand", tab: "brand", inputId: "field-sorotan_brand" },
  { key: "nama_warna_primer", label: "Nama Warna Primer", tab: "style", inputId: "field-nama_warna_primer" },
  { key: "warna_primer", label: "Kode Warna Primer", tab: "style", inputId: "field-warna_primer" },
  { key: "nama_warna_aksen", label: "Nama Warna Aksen", tab: "style", inputId: "field-nama_warna_aksen" },
  { key: "warna_aksen", label: "Kode Warna Aksen", tab: "style", inputId: "field-warna_aksen" },
  { key: "judul_produk", label: "Judul Produk Utama", tab: "brand", inputId: "field-judul_produk" },
  { key: "sorotan_judul", label: "Kata Sorotan Judul", tab: "brand", inputId: "field-sorotan_judul" },
  { key: "tagline_3_poin", label: "Tagline 3 Poin", tab: "brand", inputId: "field-tagline_3_poin" },
  { key: "jumlah_varian", label: "Jumlah Varian (Otomatis)", tab: "variants" },
  { key: "jenis_produk", label: "Jenis Barang / Produk", tab: "brand", inputId: "field-jenis_produk" },
  { key: "deskripsi_kemasan", label: "Deskripsi Visual Kemasan", tab: "brand", inputId: "field-deskripsi_kemasan" },
  { key: "daftar_varian_ukuran", label: "Daftar Varian Ukuran", tab: "variants" },
  { key: "daftar_fitur_bawah", label: "4 Fitur Keunggulan Bawah", tab: "features" },
  { key: "judul_kartu_kegunaan", label: "Judul Kartu Kegunaan", tab: "features", inputId: "field-judul_kartu_kegunaan" },
  { key: "daftar_kegunaan_format", label: "Daftar Item Kegunaan", tab: "features" },
  { key: "teks_badge_sudut", label: "Teks Badge Sudut", tab: "features", inputId: "field-teks_badge_sudut" },
  { key: "gaya_pencahayaan", label: "Gaya Pencahayaan & Kamera", tab: "style", inputId: "field-gaya_pencahayaan" },
];

export function buildPlaceholderMap(vars: PosterVariables): Record<string, string> {
  const varianText = vars.varian_ukuran
    .map((v, idx) => {
      const posLabel =
        idx === 0
          ? "Paling kiri (paling kecil)"
          : idx === vars.varian_ukuran.length - 1
            ? "Paling kanan (paling besar)"
            : `Urutan ke-${idx + 1}`;
      const cap = v.label_kapasitas.trim() ? ` (${v.label_kapasitas})` : "";
      return `  • ${posLabel}: skala tinggi visual ${v.skala_tinggi}%, di atasnya badge kapsul bertuliskan "${v.label_ukuran}${cap}".`;
    })
    .join("\n");

  const fiturText = vars.daftar_fitur
    .map((f, idx) => `  ${idx + 1}. ${f.ikon_deskripsi} — Label: "${f.label}"`)
    .join("\n");

  const kegunaanText = vars.daftar_kegunaan
    .map((item) => `  ✓ ${item}`)
    .join("\n");

  const logoDesc = vars.logo_image_url
    ? `logo gambar merek kustom yang diunggah (tempatkan logo terlampir secara utuh di bagian paling atas tengah, ${vars.tampilkan_teks_dengan_logo ? `disertai tulisan "${vars.nama_brand}" di bawahnya` : "menggantikan ikon dan teks logo default"})`
    : vars.deskripsi_logo;

  return {
    rasio_aspek: vars.rasio_aspek,
    deskripsi_latar: vars.deskripsi_latar,
    warna_latar: vars.warna_latar,
    deskripsi_logo: logoDesc,
    nama_brand: vars.nama_brand,
    sorotan_brand: vars.sorotan_brand,
    nama_warna_primer: vars.nama_warna_primer,
    warna_primer: vars.warna_primer,
    nama_warna_aksen: vars.nama_warna_aksen,
    warna_aksen: vars.warna_aksen,
    judul_produk: vars.judul_produk,
    sorotan_judul: vars.sorotan_judul,
    tagline_3_poin: vars.tagline_3_poin,
    jumlah_varian: String(vars.varian_ukuran.length),
    jenis_produk: vars.jenis_produk,
    deskripsi_kemasan: vars.deskripsi_kemasan,
    daftar_varian_ukuran: varianText,
    daftar_fitur_bawah: fiturText,
    judul_kartu_kegunaan: vars.judul_kartu_kegunaan,
    daftar_kegunaan_format: kegunaanText,
    teks_badge_sudut: vars.teks_badge_sudut,
    gaya_pencahayaan: vars.gaya_pencahayaan,
  };
}

export function compileMasterPrompt(vars: PosterVariables): string {
  const map = buildPlaceholderMap(vars);
  return MASTER_PROMPT_TEMPLATE.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return key in map ? map[key] : match;
  });
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: "kemasku-tictas",
    nama: "Kantong Plastik Tic-Tas HD",
    kategori: "Kemasan Plastik (Referensi Asli)",
    ringkasan: "Template identik dengan gambar referensi Kemasku dengan 5 ukuran bertingkat.",
    variables: {
      nama_brand: "KEMASKU",
      sorotan_brand: "KU",
      deskripsi_logo: "ikon garis tas belanja minimalis melengkung di atas tulisan brand",
      judul_produk: "KANTONG PLASTIK TIC-TAS",
      sorotan_judul: "HD",
      tagline_3_poin: "Kuat • Higienis • Tidak Mudah Sobek",
      jenis_produk: "kantong plastik HDPE putih susu dalam kemasan pak bersegel pabrik",
      deskripsi_kemasan:
        "kemasan plastik transparan persegi panjang berisi tumpukan kantong plastik HDPE putih susu yang terlipat rapi, dengan stiker label merek vertikal berwarna biru tua dan aksen oranye di bagian tengah depan setiap pak",
      varian_ukuran: [
        { id: "v1", label_ukuran: "10 × 17 cm", label_kapasitas: "1/4 kg", skala_tinggi: 54 },
        { id: "v2", label_ukuran: "12 × 24 cm", label_kapasitas: "1/2 kg", skala_tinggi: 65 },
        { id: "v3", label_ukuran: "15 × 27 cm", label_kapasitas: "1 kg", skala_tinggi: 77 },
        { id: "v4", label_ukuran: "18 × 30 cm", label_kapasitas: "1½ kg", skala_tinggi: 88 },
        { id: "v5", label_ukuran: "18 × 35 cm", label_kapasitas: "2 kg", skala_tinggi: 100 },
      ],
      daftar_fitur: [
        { id: "f1", ikon_key: "package", ikon_deskripsi: "Ikon garis kantong belanja", label: "HDPE Berkualitas" },
        { id: "f2", ikon_key: "leaf", ikon_deskripsi: "Ikon garis dua helai daun higienis", label: "Higienis" },
        { id: "f3", ikon_key: "shield-bolt", ikon_deskripsi: "Ikon garis perisai dengan simbol petir", label: "Tidak Mudah Sobek" },
        { id: "f4", ikon_key: "shield-check", ikon_deskripsi: "Ikon garis perisai dengan tanda centang", label: "Aman untuk Kemasan" },
      ],
      judul_kartu_kegunaan: "Cocok untuk:",
      daftar_kegunaan: ["Makanan", "Sayur & Buah", "Toko Kelontong", "UMKM", "Kemasan Harian"],
      teks_badge_sudut: "Ukuran Lengkap",
      nama_warna_primer: "Biru Navy Gelap",
      warna_primer: "#0B2447",
      nama_warna_aksen: "Oranye Cerah",
      warna_aksen: "#FF6B00",
      deskripsi_latar: "studio putih bersih bernuansa abu-abu sangat lembut",
      warna_latar: "#F8FAFC",
      gaya_pencahayaan:
        "Pencahayaan studio komersial lembut merata tanpa silau berlebih, sudut kamera sejajar mata (eye-level straight-on) dengan fokus tajam di seluruh varian produk",
      rasio_aspek: "1:1",
    },
  },
  {
    id: "botol-pet-kuliner",
    nama: "Botol PET Minuman & Sambal",
    kategori: "Kemasan Botol F&B",
    ringkasan: "5 ukuran botol PET transparan dengan tutup segel anti-bocor untuk UMKM kuliner.",
    variables: {
      nama_brand: "BOTOLKITA",
      sorotan_brand: "KITA",
      deskripsi_logo: "ikon garis siluet botol minimalis di atas tulisan brand",
      judul_produk: "BOTOL PET FOOD GRADE",
      sorotan_judul: "TEBAL",
      tagline_3_poin: "Bening Kristal • Anti Bocor • Tutup Segel",
      jenis_produk: "botol plastik PET bening kosong dengan tutup ulir segel rapat",
      deskripsi_kemasan:
        "botol plastik PET transparan mengilap berkualitas tinggi, dinding botol kokoh dan jernih, dilengkapi tutup ulir segel berwarna gelap yang terpasang presisi tanpa label merek agar bentuk botol terlihat bersih",
      varian_ukuran: [
        { id: "b1", label_ukuran: "100 ml", label_kapasitas: "Mini Shot", skala_tinggi: 50 },
        { id: "b2", label_ukuran: "250 ml", label_kapasitas: "Standar", skala_tinggi: 64 },
        { id: "b3", label_ukuran: "350 ml", label_kapasitas: "Kafe", skala_tinggi: 76 },
        { id: "b4", label_ukuran: "500 ml", label_kapasitas: "Medium", skala_tinggi: 88 },
        { id: "b5", label_ukuran: "1000 ml", label_kapasitas: "1 Liter", skala_tinggi: 100 },
      ],
      daftar_fitur: [
        { id: "bf1", ikon_key: "sparkles", ikon_deskripsi: "Ikon garis kilau kristal bening", label: "PET Bening Kristal" },
        { id: "bf2", ikon_key: "shield-check", ikon_deskripsi: "Ikon garis perisai standar pangan", label: "Food Grade BPA Free" },
        { id: "bf3", ikon_key: "droplet", ikon_deskripsi: "Ikon garis tetesan anti bocor", label: "Tutup Segel Rapat" },
        { id: "bf4", ikon_key: "layers", ikon_deskripsi: "Ikon garis lapisan dinding tebal", label: "Plastik Tebal Kokoh" },
      ],
      judul_kartu_kegunaan: "Cocok untuk:",
      daftar_kegunaan: ["Kopi Susu", "Jus Segar", "Sambal Rumahan", "Madu & Jamu", "Bumbu Cair"],
      teks_badge_sudut: "Siap Kirim",
      nama_warna_primer: "Slate Gelap",
      warna_primer: "#111827",
      nama_warna_aksen: "Merah Cabai",
      warna_aksen: "#DC2626",
      deskripsi_latar: "studio putih bersih bernuansa abu-abu dingin lembut",
      warna_latar: "#F8FAFC",
      gaya_pencahayaan:
        "Pencahayaan studio produk kaca & plastik bening dengan highlight tepi yang halus untuk menonjolkan kejernihan botol, sudut kamera eye-level lurus",
      rasio_aspek: "1:1",
    },
  },
  {
    id: "standing-pouch-kraft",
    nama: "Standing Pouch Kertas Kraft",
    kategori: "Kemasan Kopi & Snack",
    ringkasan: "4 ukuran pouch kertas kraft coklat berjendela transparan dan zipper lock.",
    variables: {
      nama_brand: "KEMASRAPI",
      sorotan_brand: "RAPI",
      deskripsi_logo: "ikon garis kemasan pouch berdiri minimalis di atas tulisan brand",
      judul_produk: "STANDING POUCH KRAFT",
      sorotan_judul: "ZIPPER",
      tagline_3_poin: "Kedap Udara • Laminasi Food Grade • Tampilan Premium",
      jenis_produk: "kemasan standing pouch kertas kraft coklat natural dengan jendela transparan",
      deskripsi_kemasan:
        "kemasan kantong berdiri berbahan kertas kraft coklat matte tekstur alami dengan bagian bawah lipatan kokoh, garis segel zipper lock di bagian atas, dan jendela plastik bening persegi panjang di bagian tengah depan",
      varian_ukuran: [
        { id: "p1", label_ukuran: "10 × 17 cm", label_kapasitas: "100 gram", skala_tinggi: 58 },
        { id: "p2", label_ukuran: "12 × 20 cm", label_kapasitas: "250 gram", skala_tinggi: 72 },
        { id: "p3", label_ukuran: "14 × 22 cm", label_kapasitas: "500 gram", skala_tinggi: 86 },
        { id: "p4", label_ukuran: "16 × 24 cm", label_kapasitas: "1 kg", skala_tinggi: 100 },
      ],
      daftar_fitur: [
        { id: "pf1", ikon_key: "layers", ikon_deskripsi: "Ikon garis lapisan laminasi pelindung", label: "Laminasi Anti Minyak" },
        { id: "pf2", ikon_key: "shield-check", ikon_deskripsi: "Ikon garis perisai segel zipper", label: "Zipper Lock Kuat" },
        { id: "pf3", ikon_key: "leaf", ikon_deskripsi: "Ikon garis daun ramah lingkungan", label: "Kertas Kraft Tebal" },
        { id: "pf4", ikon_key: "package", ikon_deskripsi: "Ikon garis kemasan berdiri kokoh", label: "Berdiri Tegak Rapi" },
      ],
      judul_kartu_kegunaan: "Cocok untuk:",
      daftar_kegunaan: ["Biji Kopi", "Keripik & Snack", "Granola", "Teh Herbal", "Bubuk Minuman"],
      teks_badge_sudut: "Best Seller",
      nama_warna_primer: "Cokelat Espresso",
      warna_primer: "#2C1810",
      nama_warna_aksen: "Emas Amber",
      warna_aksen: "#D97706",
      deskripsi_latar: "studio putih hangat sangat bersih",
      warna_latar: "#FAFAF9",
      gaya_pencahayaan:
        "Pencahayaan studio lembut berarah dari samping untuk menonjolkan tekstur kertas kraft dan kilau jendela plastik, sudut kamera lurus eye-level",
      rasio_aspek: "1:1",
    },
  },
  {
    id: "kardus-packing-polos",
    nama: "Kardus Packing E-Commerce",
    kategori: "Karton & Logistik",
    ringkasan: "5 ukuran kotak kardus bergelombang coklat untuk kebutuhan pengiriman paket.",
    variables: {
      nama_brand: "BOXINDO",
      sorotan_brand: "INDO",
      deskripsi_logo: "ikon garis kotak kubus 3D minimalis di atas tulisan brand",
      judul_produk: "KARDUS PACKING POLOS",
      sorotan_judul: "TEBAL",
      tagline_3_poin: "Presisi Lipatan • Tahan Tekan • Aman Pengiriman",
      jenis_produk: "kotak kardus karton corrugated coklat polos dalam kondisi terlipat rapi membentuk boks",
      deskripsi_kemasan:
        "kotak kardus polos berbahan kraft corrugated flute B yang kokoh, permukaan coklat natural bersih, tepian potongan die-cut rapi dengan garis lipatan tegas dan tutup pengunci di bagian depan",
      varian_ukuran: [
        { id: "k1", label_ukuran: "15 × 10 × 5 cm", label_kapasitas: "Aksesoris", skala_tinggi: 48 },
        { id: "k2", label_ukuran: "20 × 15 × 8 cm", label_kapasitas: "Skincare", skala_tinggi: 60 },
        { id: "k3", label_ukuran: "25 × 20 × 10 cm", label_kapasitas: "Fashion", skala_tinggi: 73 },
        { id: "k4", label_ukuran: "30 × 25 × 15 cm", label_kapasitas: "Elektronik", skala_tinggi: 86 },
        { id: "k5", label_ukuran: "40 × 30 × 20 cm", label_kapasitas: "Kargo Besar", skala_tinggi: 100 },
      ],
      daftar_fitur: [
        { id: "kf1", ikon_key: "layers", ikon_deskripsi: "Ikon garis lapisan karton bergelombang", label: "Bahan B-Flute Kokoh" },
        { id: "kf2", ikon_key: "shield-bolt", ikon_deskripsi: "Ikon garis perisai tahan benturan", label: "Tahan Tumpuk" },
        { id: "kf3", ikon_key: "package", ikon_deskripsi: "Ikon garis kotak presisi", label: "Lipatan Die-Cut Rapi" },
        { id: "kf4", ikon_key: "truck", ikon_deskripsi: "Ikon garis truk pengiriman ekspedisi", label: "Standar Ekspedisi" },
      ],
      judul_kartu_kegunaan: "Cocok untuk:",
      daftar_kegunaan: ["Seller Marketplace", "Skincare & Kosmetik", "Pakaian & Sepatu", "Hampers", "Logistik UMKM"],
      teks_badge_sudut: "Harga Grosir",
      nama_warna_primer: "Biru Slate Gelap",
      warna_primer: "#0F172A",
      nama_warna_aksen: "Biru Kobalt",
      warna_aksen: "#2563EB",
      deskripsi_latar: "studio putih bersih bernuansa netral",
      warna_latar: "#F8FAFC",
      gaya_pencahayaan:
        "Pencahayaan studio fotografi katalog produk bersudut sedikit tiga perempat ringan agar dimensi panjang-lebar-tinggi kardus terbaca jelas dengan refleksi lantai halus",
      rasio_aspek: "1:1",
    },
  },
];
