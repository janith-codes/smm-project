import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "accent" | "ghost" | "outline";
type ButtonSize = "sm" | "md";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const baseButtonClasses =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b35] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const buttonVariantsByVariant: Record<ButtonVariant, string> = {
  default: "bg-[#121212] text-white shadow-sm hover:bg-[#2a2a2a]",
  accent:
    "bg-[#ff6b35] text-white shadow-[0_10px_24px_rgba(255,107,53,0.22)] hover:bg-[#e85d2e]",
  ghost: "text-black/72 hover:bg-black/[0.06] hover:text-black",
  outline:
    "border border-black/12 bg-white text-[#171717] shadow-sm hover:border-black/28 hover:bg-[#faf8f2]",
};

const buttonVariantsBySize: Record<ButtonSize, string> = {
  sm: "h-10 px-4",
  md: "h-11 px-5",
};

export function buttonVariants({
  variant = "default",
  size = "sm",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    baseButtonClasses,
    buttonVariantsByVariant[variant],
    buttonVariantsBySize[size],
    className,
  );
}

export function Button({
  className,
  variant = "default",
  size = "sm",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonVariants({ variant, size, className })}
      type={type}
      {...props}
    />
  );
}
