import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "outline";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-emerald-600 text-white hover:bg-emerald-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  danger: "bg-red-600 text-white hover:bg-red-700",
  outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
};

export function Button({
  variant = "primary",
  loading,
  disabled,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading ? "Loading…" : children}
    </button>
  );
}