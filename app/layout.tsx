import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-easy-crop/react-easy-crop.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Lego Creator",
  description: "Crea mosaicos con tus imágenes favoritas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <main>
            <Toaster />
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
