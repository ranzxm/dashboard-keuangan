import type { ReactNode } from "react";

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): React.ReactNode {
  return <section className={`card ${className ?? ""}`}>{children}</section>;
}
