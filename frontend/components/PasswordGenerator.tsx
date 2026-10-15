"use client";

import { useState } from "react";
import {
  alphabetSize,
  alphanumericAlphabetSize,
  alphanumericPassword,
  entropyBits,
  passphrase,
  pin,
  randomPassword,
  type PasswordFormat,
} from "@/lib/password";

const formats: { id: PasswordFormat; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "passphrase", label: "Passphrase" },
  { id: "pin", label: "PIN" },
  { id: "alphanumeric", label: "Alphanumeric" },
];

export function PasswordGenerator() {
  const [format, setFormat] = useState<PasswordFormat>("random");
  const [length, setLength] = useState(16);
  const [words, setWords] = useState(5);
  const [separator, setSeparator] = useState("-");
  const [capitalize, setCapitalize] = useState(false);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const size =
    format === "alphanumeric" ? alphanumericAlphabetSize : alphabetSize({ lower, upper, numbers, symbols });
  const entropy = entropyBits(format, length, size, words);

  function selectFormat(next: PasswordFormat) {
    setFormat(next);
    setPassword("");
    setError(null);
    setCopied(false);
    if (next === "pin") {
      setLength(6);
    } else if (next === "random" || next === "alphanumeric") {
      setLength(16);
    }
  }

  function generate() {
    try {
      let value = "";
      if (format === "random") {
        value = randomPassword(length, { lower, upper, numbers, symbols });
      } else if (format === "passphrase") {
        value = passphrase(words, separator, capitalize);
      } else if (format === "pin") {
        value = pin(length);
      } else {
        value = alphanumericPassword(length);
      }
      setPassword(value);
      setError(null);
      setCopied(false);
    } catch (caught) {
      setPassword("");
      setError(caught instanceof Error ? caught.message : "Could not generate a password.");
    }
  }

  async function copy() {
    if (!password) {
      return;
    }
    await navigator.clipboard.writeText(password);
    setCopied(true);
  }

  const lengthMin = format === "pin" ? 4 : 8;
  const lengthMax = format === "pin" ? 12 : 64;

  return (
    <div className="rounded-2xl border border-line bg-card p-5 sm:p-6">
      <p className="text-sm text-muted">Generated in the browser with Web Crypto. Nothing is uploaded.</p>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Password format">
        {formats.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectFormat(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              format === item.id ? "bg-accent text-white" : "border border-line bg-background"
            }`}
            aria-pressed={format === item.id}
          >
            {item.label}
          </button>
        ))}
      </div>
      {format === "passphrase" ? (
        <>
          <label className="mt-4 block text-sm font-medium">
            <span className="mb-2 flex justify-between">
              Words <span>{words}</span>
            </span>
            <input
              type="range"
              min={3}
              max={8}
              value={words}
              onChange={(event) => setWords(Number(event.target.value))}
              className="w-full"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Separator
            <select
              value={separator}
              onChange={(event) => setSeparator(event.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-background px-3 py-2"
            >
              <option value="-">Hyphen</option>
              <option value=" ">Space</option>
              <option value=".">Dot</option>
            </select>
          </label>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={capitalize} onChange={(event) => setCapitalize(event.target.checked)} />
            Capitalize each word
          </label>
        </>
      ) : (
        <label className="mt-4 block text-sm font-medium">
          <span className="mb-2 flex justify-between">
            Length <span>{length}</span>
          </span>
          <input
            type="range"
            min={lengthMin}
            max={lengthMax}
            value={length}
            onChange={(event) => setLength(Number(event.target.value))}
            className="w-full"
          />
        </label>
      )}
      {format === "random" && (
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <Checkbox label="Lowercase" checked={lower} onChange={setLower} />
          <Checkbox label="Uppercase" checked={upper} onChange={setUpper} />
          <Checkbox label="Numbers" checked={numbers} onChange={setNumbers} />
          <Checkbox label="Symbols" checked={symbols} onChange={setSymbols} />
        </div>
      )}
      <p className="mt-3 text-sm text-muted">About {entropy} bits of entropy for this format.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={generate} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
          Generate
        </button>
        <button type="button" onClick={copy} className="rounded-full border border-line px-4 py-2 text-sm font-semibold">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {password && (
        <p className="mt-4 break-all rounded-xl border border-line bg-background p-3 font-mono text-sm">{password}</p>
      )}
    </div>
  );
}

function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      {label}
    </label>
  );
}
