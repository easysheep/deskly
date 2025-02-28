"use client";

import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

interface ClientAuthWrapperProps {
  children: React.ReactNode;
}

export default function ClientAuthWrapper({ children }: ClientAuthWrapperProps) {
  const pathname = usePathname();

  // Define paths where the UserButton should be displayed
  const userButtonPaths: string[] = ["/"];

  // Determine if the current path is public and does not need authentication
  const isWallOfTrust = pathname === "/" || pathname.startsWith("/walloftrust");

  return (
    <>
      {isWallOfTrust ? (
        children // Directly render children if the route is public
      ) : (
        <>
          {/* SignedIn: Content shown when user is authenticated */}
          <SignedIn>
            {/* Only show UserButton if current path is in userButtonPaths */}
            {userButtonPaths.includes(pathname) ? (
              <UserButton afterSignOutUrl="/" />
            ) : null}
            {children}
          </SignedIn>

          {/* SignedOut: Content shown when user is not authenticated */}
          <SignedOut>
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-center p-4">
              <h1 className="text-2xl font-semibold text-white">
                Access Restricted
              </h1>
              <p className="text-gray-500 mb-4">
                You need to sign in to access this page.
              </p>
              <SignInButton>
                <button className="px-2 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </SignedOut>
        </>
      )}
    </>
  );
}
