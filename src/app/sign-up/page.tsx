import { Suspense } from "react";
import { AuthForm } from "@/components/auth/auth-form";

export default function SignUpPage(): React.ReactNode {
  return (
    <Suspense>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
