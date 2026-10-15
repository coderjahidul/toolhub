"use client";

import {
  ImageCompressorForm,
  ImageConverterForm,
  ImageResizerForm,
  PdfCompressForm,
  PdfMergeForm,
} from "@/components/FileTools";
import { JsonFormatter } from "@/components/JsonFormatter";
import { PasswordGenerator } from "@/components/PasswordGenerator";
import type { ToolDefinition } from "@/lib/tools";

export function ToolWorkspace({ tool }: { tool: ToolDefinition }) {
  if (tool.slug === "image-compressor") {
    return <ImageCompressorForm tool={tool} />;
  }

  if (tool.slug === "image-converter") {
    return <ImageConverterForm tool={tool} />;
  }

  if (tool.slug === "image-resizer") {
    return <ImageResizerForm tool={tool} />;
  }

  if (tool.slug === "pdf-merge") {
    return <PdfMergeForm tool={tool} />;
  }

  if (tool.slug === "pdf-compress") {
    return <PdfCompressForm tool={tool} />;
  }

  if (tool.input === "json") {
    return <JsonFormatter />;
  }

  return <PasswordGenerator />;
}
