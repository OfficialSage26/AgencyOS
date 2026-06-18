import { SignUp } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { authAppearance } from "@/components/auth/appearance";

export default function SignUpPage() {
  return (
    <AuthShell>
      <SignUp appearance={authAppearance} />
    </AuthShell>
  );
}
