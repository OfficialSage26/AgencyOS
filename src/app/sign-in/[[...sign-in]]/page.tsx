import { SignIn } from "@clerk/nextjs";
import { AuthShell } from "@/components/auth/auth-shell";
import { authAppearance } from "@/components/auth/appearance";

export default function SignInPage() {
  return (
    <AuthShell>
      <SignIn appearance={authAppearance} />
    </AuthShell>
  );
}
