"use client";

import { useState } from "react";

export function useDownload() {
  const [loading, setLoading] = useState(false);

  async function download(url: string, fallbackName?: string) {
    setLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Download failed.");
      }

      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = objectUrl;

      const header = response.headers.get("Content-Disposition");
      const match = header?.match(/filename="?([^"]+)"?/);
      link.download = match?.[1] ?? fallbackName ?? "download.csv";

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(objectUrl);
    } catch (error) {
      throw error instanceof Error ? error : new Error("Download failed.");
    } finally {
      setLoading(false);
    }
  }

  function openPrintView(url: string) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return { download, openPrintView, loading };
}
