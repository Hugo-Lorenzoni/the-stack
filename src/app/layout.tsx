import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster } from "sonner";
import { env } from "node:process";

const inter = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "CPV FPMs",
  description:
    "Photos des événements de la Faculté Polytechnique de Mons (FPMs)",
  ...(env.NEXTAUTH_URL === "https://cpv-test.magellan.fpms.ac.be/" && {
    robots: {
      index: false,
      follow: false,
    },
  }),
};

const toastOptions = { duration: 10000 };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
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
