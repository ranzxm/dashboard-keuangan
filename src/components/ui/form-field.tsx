import type { ReactNode } from "react";

export function FormField({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}): React.ReactNode {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}
