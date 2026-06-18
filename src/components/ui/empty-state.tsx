import type { LucideIcon } from "lucide-react";

export function EmptyState({
  description,
  icon: Icon,
  title,
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}): React.ReactNode {
  return (
    <div className="empty-state">
      <span className="empty-state-icon">
        <Icon size={24} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
