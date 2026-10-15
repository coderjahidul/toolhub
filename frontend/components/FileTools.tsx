"use client";

import { useState } from "react";
import { ToolShell } from "@/components/ToolShell";
import type { ToolDefinition } from "@/lib/tools";

export function ImageCompressorForm({ tool }: { tool: ToolDefinition }) {
  const [quality, setQuality] = useState(75);

  return (
    <ToolShell
      endpoint={tool.endpoint ?? ""}
      accept={tool.accept ?? ""}
      maxBytes={tool.maxBytes ?? 0}
      hint="JPG, PNG, WebP, or GIF. Maximum 10 MB. Quality applies most to JPG and WebP."
      fields={{ quality: String(quality) }}
      options={
        <label className="block text-sm">
          <span className="mb-2 flex justify-between font-medium">
            Quality <span>{quality}</span>
          </span>
          <input
            type="range"
            min={40}
            max={95}
            value={quality}
            onChange={(event) => setQuality(Number(event.target.value))}
            className="w-full"
          />
        </label>
      }
    />
  );
}

export function ImageConverterForm({ tool }: { tool: ToolDefinition }) {
  const [format, setFormat] = useState("webp");

  return (
    <ToolShell
      endpoint={tool.endpoint ?? ""}
      accept={tool.accept ?? ""}
      maxBytes={tool.maxBytes ?? 0}
      hint="Convert one image to JPG, PNG, WebP, or GIF. Maximum 10 MB."
      fields={{ format, quality: "85" }}
      options={
        <label className="block text-sm font-medium">
          Output format
          <select
            value={format}
            onChange={(event) => setFormat(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
          >
            <option value="jpg">JPG</option>
            <option value="png">PNG</option>
            <option value="webp">WebP</option>
            <option value="gif">GIF</option>
          </select>
        </label>
      }
    />
  );
}

export function ImageResizerForm({ tool }: { tool: ToolDefinition }) {
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [width, setWidth] = useState("800");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [maintainAspect, setMaintainAspect] = useState(true);

  return (
    <ToolShell
      endpoint={tool.endpoint ?? ""}
      accept={tool.accept ?? ""}
      maxBytes={tool.maxBytes ?? 0}
      hint="Resize by pixels or percent. Maximum 10 MB."
      fields={
        mode === "percent"
          ? { percent, maintain_aspect: maintainAspect ? "1" : "0" }
          : {
              width,
              height,
              maintain_aspect: maintainAspect ? "1" : "0",
            }
      }
      options={
        <div className="grid gap-4">
          <div className="flex gap-2 text-sm">
            <button
              type="button"
              onClick={() => setMode("pixels")}
              className={`rounded-full px-3 py-1 ${mode === "pixels" ? "bg-accent text-white" : "border border-line"}`}
            >
              Pixels
            </button>
            <button
              type="button"
              onClick={() => setMode("percent")}
              className={`rounded-full px-3 py-1 ${mode === "percent" ? "bg-accent text-white" : "border border-line"}`}
            >
              Percent
            </button>
          </div>
          {mode === "pixels" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium">
                Width
                <input
                  inputMode="numeric"
                  value={width}
                  onChange={(event) => setWidth(event.target.value.replace(/[^\d]/g, ""))}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
                />
              </label>
              <label className="text-sm font-medium">
                Height
                <input
                  inputMode="numeric"
                  value={height}
                  onChange={(event) => setHeight(event.target.value.replace(/[^\d]/g, ""))}
                  className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
                  placeholder="Optional"
                />
              </label>
            </div>
          ) : (
            <label className="text-sm font-medium">
              Percent of original
              <input
                inputMode="numeric"
                value={percent}
                onChange={(event) => setPercent(event.target.value.replace(/[^\d]/g, ""))}
                className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
              />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={maintainAspect}
              onChange={(event) => setMaintainAspect(event.target.checked)}
            />
            Keep aspect ratio
          </label>
        </div>
      }
    />
  );
}

export function PdfMergeForm({ tool }: { tool: ToolDefinition }) {
  return (
    <ToolShell
      endpoint={tool.endpoint ?? ""}
      accept={tool.accept ?? ""}
      maxBytes={tool.maxBytes ?? 0}
      multiple
      minFiles={2}
      maxFiles={10}
      hint="Add 2 to 10 PDFs, up to 20 MB each. They merge in the listed order."
      fields={{}}
    />
  );
}

export function PdfCompressForm({ tool }: { tool: ToolDefinition }) {
  const [level, setLevel] = useState("ebook");

  return (
    <ToolShell
      endpoint={tool.endpoint ?? ""}
      accept={tool.accept ?? ""}
      maxBytes={tool.maxBytes ?? 0}
      hint="One PDF up to 20 MB. Screen is smallest. Printer keeps more detail."
      fields={{ level }}
      options={
        <label className="block text-sm font-medium">
          Compression level
          <select
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
          >
            <option value="screen">Screen</option>
            <option value="ebook">Ebook</option>
            <option value="printer">Printer</option>
          </select>
        </label>
      }
    />
  );
}
