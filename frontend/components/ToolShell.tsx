"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { UploadError, uploadForm } from "@/lib/api";
import { formatBytes } from "@/lib/format";

type ToolShellProps = {
  endpoint: string;
  accept: string;
  maxBytes: number;
  multiple?: boolean;
  minFiles?: number;
  maxFiles?: number;
  hint: string;
  options?: ReactNode;
  fields: Record<string, string>;
};

type ResultState = {
  url: string;
  filename: string;
  bytes: number;
  sourceBytes: number;
  dailyRemaining: number | null;
  dailyLimit: number | null;
};

export function ToolShell({
  endpoint,
  accept,
  maxBytes,
  multiple = false,
  minFiles = 1,
  maxFiles = 1,
  hint,
  options,
  fields,
}: ToolShellProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"idle" | "upload" | "processing">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultState | null>(null);

  useEffect(() => {
    return () => {
      if (result?.url) {
        URL.revokeObjectURL(result.url);
      }
    };
  }, [result]);

  const sourceBytes = useMemo(
    () => files.reduce((total, file) => total + file.size, 0),
    [files],
  );

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list);
    const next = multiple ? [...files, ...incoming].slice(0, maxFiles) : incoming.slice(0, 1);
    const tooLarge = next.find((file) => file.size > maxBytes);

    if (tooLarge) {
      setError(`${tooLarge.name} is larger than ${formatBytes(maxBytes)}.`);
      return;
    }

    setError(null);
    setResult(null);
    setFiles(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();

    if (files.length < minFiles) {
      setError(minFiles === 1 ? "Choose a file first." : `Add at least ${minFiles} files.`);
      return;
    }

    const form = new FormData();
    if (multiple) {
      files.forEach((file) => form.append("files[]", file));
    } else {
      form.append("file", files[0]);
    }

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== "") {
        form.append(key, value);
      }
    });

    setPhase("upload");
    setProgress(0);
    setError(null);

    try {
      const uploaded = await uploadForm(endpoint, form, (ratio) => {
        setProgress(ratio);
        if (ratio >= 1) {
          setPhase("processing");
        }
      });
      const url = URL.createObjectURL(uploaded.blob);
      setResult({
        url,
        filename: uploaded.filename,
        bytes: uploaded.blob.size,
        sourceBytes,
        dailyRemaining: uploaded.dailyRemaining,
        dailyLimit: uploaded.dailyLimit,
      });
      setPhase("idle");
    } catch (caught) {
      setPhase("idle");
      setError(caught instanceof UploadError ? caught.message : "The file could not be processed.");
    }
  }

  const busy = phase !== "idle";
  const percent = Math.round(progress * 100);

  return (
    <form onSubmit={onSubmit} className="relative overflow-hidden rounded-2xl border border-line bg-card p-5 sm:p-6">
      <div className={busy ? "pointer-events-none select-none opacity-40" : undefined} aria-hidden={busy}>
      <label
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center rounded-xl border border-dashed px-4 py-10 text-center ${
          dragging ? "border-accent bg-accent/5" : "border-line"
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          className="sr-only"
          onChange={(event) => {
            if (event.target.files) {
              addFiles(event.target.files);
            }
            event.target.value = "";
          }}
        />
        <span className="font-medium">Drop files here or browse</span>
        <span className="mt-2 max-w-md text-sm text-muted">{hint}</span>
      </label>

      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-line rounded-xl border border-line">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${index}`} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
              <span className="truncate">
                {file.name}{" "}
                <span className="text-muted">({formatBytes(file.size)})</span>
              </span>
              <button
                type="button"
                className="text-muted hover:text-foreground"
                onClick={() => setFiles(files.filter((_, itemIndex) => itemIndex !== index))}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {options && <div className="mt-5">{options}</div>}

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={phase !== "idle"}
        className="mt-5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {phase === "idle" ? "Run tool" : "Please wait"}
      </button>

      {result && (
        <div className="mt-5 rounded-xl border border-line bg-background p-4">
          <p className="font-medium">{result.filename}</p>
          <p className="mt-1 text-sm text-muted">
            {formatBytes(result.sourceBytes)} in, {formatBytes(result.bytes)} out
            {result.dailyRemaining !== null && result.dailyLimit !== null
              ? ` · ${result.dailyRemaining} of ${result.dailyLimit} operations left today`
              : ""}
          </p>
          <a
            href={result.url}
            download={result.filename}
            className="mt-3 inline-flex rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent"
          >
            Download
          </a>
        </div>
      )}
      </div>

      {busy && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-card/85 px-6 text-center backdrop-blur-[2px]"
          role="status"
          aria-live="polite"
        >
          <div className="upload-spinner" aria-hidden="true" />
          <div>
            <p className="text-lg font-semibold">
              {phase === "processing" ? "Processing your file" : "Uploading"}
            </p>
            <p className="mt-1 max-w-xs truncate text-sm text-muted">
              {files.length === 1 ? files[0].name : `${files.length} files`}
            </p>
          </div>
          <div className="upload-track w-full max-w-xs">
            {phase === "processing" ? (
              <div className="upload-bar-busy" />
            ) : (
              <div className="upload-bar" style={{ width: `${percent}%` }} />
            )}
          </div>
          <p className="text-sm text-muted">
            {phase === "processing" ? "Almost done" : `${percent}%`}
          </p>
        </div>
      )}
    </form>
  );
}
