"use client";

import { useRef, useState } from "react";
import { Button } from "./ui";
import { cn } from "@/lib/utils";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
};

export function ImageUploader({ value, onChange, max = 5 }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pending, setPending] = useState<string[]>([]);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    const remaining = max - value.length - pending.length;
    if (remaining <= 0) {
      setError(`Você já selecionou o máximo de ${max} imagens.`);
      return;
    }
    const toUpload = Array.from(files).slice(0, remaining);
    const previews = toUpload.map((f) => URL.createObjectURL(f));
    setPending((p) => [...p, ...previews]);
    setUploading(true);
    try {
      const fd = new FormData();
      toUpload.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.urls) {
        throw new Error(data.error || "Falha ao enviar a imagem.");
      }
      onChange([...value, ...data.urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      previews.forEach((u) => URL.revokeObjectURL(u));
      setPending([]);
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const addUrl = () => {
    setError(null);
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!/^https?:\/\/.+/i.test(trimmed)) {
      setError("Informe uma URL válida (ex: https://...).");
      return;
    }
    if (value.length >= max) {
      setError(`Você já adicionou o máximo de ${max} imagens.`);
      return;
    }
    onChange([...value, trimmed]);
    setUrl("");
  };

  const remove = (url: string) => onChange(value.filter((u) => u !== url));

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const all = [...value, ...pending];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {all.map((src, idx) => {
          const isPending = idx >= value.length;
          return (
            <div
              key={src}
              className="relative h-24 w-24 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-line-soft)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={isPending ? "Enviando..." : `Imagem ${idx + 1}`}
                className={cn("h-full w-full object-cover", isPending && "opacity-50")}
              />
              {!isPending && (
                <>
                  <span className="absolute left-1 top-1 rounded-full bg-[var(--color-navy)] px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {idx === 0 ? "Capa" : idx + 1}
                  </span>
                  <div className="absolute right-1 top-1 flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(idx, -1)}
                      disabled={idx === 0}
                      className="h-5 w-5 rounded-full bg-white/90 text-xs text-[var(--color-navy)] disabled:opacity-30"
                      aria-label="Mover para a esquerda"
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      onClick={() => move(idx, 1)}
                      disabled={idx === value.length - 1}
                      className="h-5 w-5 rounded-full bg-white/90 text-xs text-[var(--color-navy)] disabled:opacity-30"
                      aria-label="Mover para a direita"
                    >
                      ›
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(src)}
                    className="absolute bottom-1 right-1 h-5 w-5 rounded-full bg-[#b85c5c] text-xs text-white"
                    aria-label="Remover imagem"
                  >
                    ×
                  </button>
                </>
              )}
              {isPending && (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-[var(--color-ink-soft)]">
                  ⏳
                </div>
              )}
            </div>
          );
        })}

        {all.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-[var(--color-line)] text-[var(--color-ink-mute)] transition hover:border-[var(--color-navy)] hover:text-[var(--color-navy)] disabled:opacity-50"
          >
            <span className="text-2xl">＋</span>
            <span className="text-[11px]">Enviar</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="Ou cole uma URL de imagem (https://...)"
          className="flex-1 rounded-xl border border-[var(--color-line)] bg-white px-3 py-2 text-sm text-[var(--color-navy)] placeholder:text-[var(--color-ink-mute)] focus:outline-none focus:border-[var(--color-navy)]"
        />
        <Button type="button" size="sm" onClick={addUrl} disabled={value.length >= max}>
          Adicionar URL
        </Button>
      </div>

      <p className="text-xs text-[var(--color-ink-mute)]">
        Até {max} imagens. Você pode enviar arquivos ou colar URLs. A primeira é a imagem de capa. {value.length}/{max} adicionadas.
      </p>
      {error && <p className="text-xs text-[#b85c5c]">{error}</p>}
    </div>
  );
}
