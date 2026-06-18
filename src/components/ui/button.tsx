import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  ref?: Ref<HTMLButtonElement>;
  variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  danger: "button-danger",
  ghost: "button-ghost",
};

export function Button({
  children,
  className,
  ref,
  variant,
  type,
  ...props
}: ButtonProps): React.ReactNode {
  const selectedVariant = variant ?? "primary";
  const buttonType = type ?? "button";

  return (
    <button
      className={`button ${variantClasses[selectedVariant]} ${className ?? ""}`}
      ref={ref}
      type={buttonType}
      {...props}
    >
      {children}
    </button>
  );
}
