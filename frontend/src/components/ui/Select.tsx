import type { SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}