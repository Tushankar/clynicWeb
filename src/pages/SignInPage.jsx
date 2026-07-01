import { SignIn } from '@clerk/clerk-react';
import { Logo } from '@/components/Logo';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <Logo className="h-12" />
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
}
