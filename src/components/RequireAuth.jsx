import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

/** Gate a standalone (no-shell) route behind a Clerk session. */
export default function RequireAuth({ children }) {
  return (
    <>
      <SignedOut><RedirectToSignIn /></SignedOut>
      <SignedIn>{children}</SignedIn>
    </>
  );
}
