import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color: string;
}

export function Badge({ children, color }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {children}
    </span>
  );
}