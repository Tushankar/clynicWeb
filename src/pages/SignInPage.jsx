import { SignIn } from '@clerk/clerk-react';
import { Stethoscope } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/30 p-4">
      <div className="flex items-center gap-2 text-xl font-semibold">
        <Stethoscope className="h-6 w-6 text-primary" />
        <span>Clinic OS</span>
      </div>
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-in" forceRedirectUrl="/" />
    </div>
  );
}
