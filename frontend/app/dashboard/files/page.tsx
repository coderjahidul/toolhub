"use client";

import { useEffect, useState } from "react";
import { DashboardFrame } from "@/components/DashboardFrame";
import { apiJson, getToken } from "@/lib/auth";
import { apiUrl, formatBytes } from "@/lib/format";

type SavedFile = {
  id: number;
  tool_slug: string;
  filename: string;
  bytes: number;
  created_at: string;
};

export default function FilesPage() {
  const [files, setFiles] = useState<SavedFile[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const data = await apiJson<{ files: SavedFile[] }>("/api/v1/account/files");
    setFiles(data.files);
  }

  useEffect(() => {
    void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Could not load files."));
  }, []);

  async function download(file: SavedFile) {
    const token = getToken();
    const response = await fetch(apiUrl(`/api/v1/account/files/${file.id}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      setError("The file could not be downloaded.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function remove(file: SavedFile) {
    await apiJson(`/api/v1/account/files/${file.id}`, { method: "DELETE" });
    setFiles((current) => current?.filter((item) => item.id !== file.id) ?? []);
  }

  return (
    <DashboardFrame>
      <p className="text-sm text-muted">
        Results from image and PDF tools are kept when you are signed in. Without Cloudflare R2 they stay on this server&apos;s disk.
      </p>
      {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card">
        {files?.length === 0 && <li className="px-4 py-6 text-sm text-muted">No saved files yet.</li>}
        {files?.map((file) => (
          <li key={file.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate font-medium">{file.filename}</p>
              <p className="text-sm text-muted">
                {file.tool_slug} · {formatBytes(file.bytes)}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => void download(file)} className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white">
                Download
              </button>
              <button type="button" onClick={() => void remove(file)} className="rounded-lg border border-line px-3 py-2 text-sm font-semibold">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </DashboardFrame>
  );
}
