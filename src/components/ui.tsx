import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger" | "soft";
  size?: "sm" | "md" | "lg";
}) {
  const variants = {
    primary:
      "bg-[var(--color-navy)] text-white hover:bg-[var(--color-navy-soft)] shadow-sm",
    secondary:
      "bg-[var(--color-rose)] text-[var(--color-navy)] hover:bg-[var(--color-rose-deep)] hover:text-white",
    ghost: "text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]",
    outline:
      "border border-[var(--color-line)] bg-white text-[var(--color-navy)] hover:bg-[var(--color-line-soft)]",
    danger: "bg-[#b85c5c] text-white hover:bg-[#a24a4a]",
    soft: "bg-white border border-[var(--color-line)] text-[var(--color-navy)] hover:border-[var(--color-navy)]",
  } as const;
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  } as const;
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/20",
        variants[variant],
        sizes[size],
        className
      )}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/10 transition",
        className
      )}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/10 transition resize-none",
        className
      )}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-[var(--color-line)] bg-white px-4 py-2.5 text-sm text-[var(--color-ink)] focus:border-[var(--color-navy)] focus:outline-none focus:ring-2 focus:ring-[var(--color-navy)]/10 transition",
        className
      )}
    >
      {children}
    </select>
  );
}

export function Label({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <label
      className={cn(
        "text-xs font-medium uppercase tracking-wider text-[var(--color-ink-soft)]",
        className
      )}
    >
      {children}
    </label>
  );
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "sage" | "sand" | "rose" | "sky" | "navy";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[var(--color-line-soft)] text-[var(--color-ink-soft)]",
    sage: "bg-[var(--color-sage)] text-[var(--color-sage-deep)]",
    sand: "bg-[var(--color-sand)] text-[var(--color-sand-deep)]",
    rose: "bg-[var(--color-rose)] text-[var(--color-navy)]",
    sky: "bg-[var(--color-sky)] text-[var(--color-navy)]",
    navy: "bg-[var(--color-navy)] text-white",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function Field({
  label,
  children,
  error,
  hint,
}: {
  label?: string;
  children: ReactNode;
  error?: string | null;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <Label>{label}</Label>}
      {children}
      {error ? (
        <p className="text-xs text-[#b85c5c]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-ink-mute)]">{hint}</p>
      ) : null}
    </div>
  );
}

export function Card({
  children,
  className,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white card-shadow",
        padded && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}
