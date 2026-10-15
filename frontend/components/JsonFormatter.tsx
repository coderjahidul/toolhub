"use client";

import { useState } from "react";

export function JsonFormatter() {
  const [input, setInput] = useState('{\n  "tool": "ToolHub"\n}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  function run(space: number | undefined) {
    try {
      const parsed = JSON.parse(input) as unknown;
      setOutput(JSON.stringify(parsed, null, space));
      setError(null);
    } catch (caught) {
      setOutput("");
      setError(caught instanceof Error ? caught.message : "Invalid JSON.");
    }
  }

  async function copy() {
    if (!output) {
      return;
    }
    await navigator.clipboard.writeText(output);
  }

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <p className="text-sm text-muted">This runs locally. Your JSON is not uploaded.</p>
      <label className="mt-4 block text-sm font-medium">
        JSON
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          rows={10}
          spellCheck={false}
          className="mt-2 w-full rounded-xl border border-line bg-background p-3 font-mono text-sm"
        />
      </label>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => run(2)} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          Format
        </button>
        <button type="button" onClick={() => run(undefined)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
          Minify
        </button>
        <button type="button" onClick={copy} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
          Copy result
        </button>
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {output && (
        <pre className="mt-4 overflow-auto rounded-xl border border-line bg-background p-3 font-mono text-sm">{output}</pre>
      )}
    </div>
  );
}
