import React, { useState } from "react";

type ApiStatus = "idle" | "checking" | "valid" | "invalid";

export function ManualApiBox() {
  const [apiKey, setApiKey] = useState<string>(
    () => sessionStorage.getItem("manual_api_key") || ""
  );
  const [status, setStatus] = useState<ApiStatus>("idle");
  const [message, setMessage] = useState<string>("");

  const handleChangeKey = (value: string) => {
    const cleaned = value.trim();
    setApiKey(cleaned);
    if (cleaned) {
      sessionStorage.setItem("manual_api_key", cleaned);
    } else {
      sessionStorage.removeItem("manual_api_key");
    }
    setStatus("idle");
    setMessage("");
  };

  const handleClearKey = () => {
    setApiKey("");
    sessionStorage.removeItem("manual_api_key");
    setStatus("idle");
    setMessage("API key dihapus dari sesi ini.");
  };

  const handleCheckApi = async () => {
    if (!apiKey) {
      setStatus("invalid");
      setMessage("Silakan paste API key terlebih dahulu.");
      return;
    }

    setStatus("checking");
    setMessage("Mengecek koneksi API...");

    try {
      // Sesuaikan URL endpoint & header dengan API yang dipakai
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`
      );

      const rawText = await res.text();
      let data: any = null;
      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = null;
        }
      }

      if (!res.ok) {
        setStatus("invalid");
        setMessage(data?.error?.message || `API tidak valid (HTTP ${res.status})`);
        return;
      }

      setStatus("valid");
      setMessage("API valid dan siap digunakan.");
    } catch (err: any) {
      setStatus("invalid");
      setMessage(err?.message || "Gagal menghubungi endpoint API.");
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <label className="block text-sm font-medium">Paste API Key</label>

      <div className="flex flex-wrap gap-2">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => handleChangeKey(e.target.value)}
          placeholder="Paste API key di sini..."
          autoComplete="off"
          className="flex-1 rounded border px-3 py-2 text-sm"
        />

        <button
          type="button"
          onClick={handleCheckApi}
          disabled={status === "checking"}
          className="rounded bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {status === "checking" ? "Mengecek..." : "Cek API"}
        </button>

        {apiKey && (
          <button
            type="button"
            onClick={handleClearKey}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Hapus
          </button>
        )}
      </div>

      {message && (
        <p
          className={`text-xs ${
            status === "valid"
              ? "text-green-600"
              : status === "invalid"
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
