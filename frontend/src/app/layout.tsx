import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import ClientAuthWrapper from "../components/ClientAuthWrapper"; // Adjust the path as needed
import { Toaster } from "react-hot-toast"; // Import Toaster

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ClientAuthWrapper>{children}</ClientAuthWrapper>
          <Toaster position="top-center" reverseOrder={false} />
        </body>
      </html>
    </ClerkProvider>
  );
}
