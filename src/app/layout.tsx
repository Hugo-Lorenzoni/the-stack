import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "CPV FPMs",
  description:
    "Photos des événements de la Faculté Polytechnique de Mons (FPMs)",
};

const toastOptions = { duration: 10000 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={font.className}>
        <Providers>
          <Nav />
          {children}
          <Toaster closeButton visibleToasts={9} toastOptions={toastOptions} />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
