import "./globals.css";
import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import { Toaster, ToasterProps } from "sonner";
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

const toastOptions: ToasterProps["toastOptions"] = {
  duration: 10000,
  classNames: {
    success:
      "border-green-200 bg-green-50 text-green-800 [&_[data-icon]_svg]:!text-green-600",
    error:
      "border-red-200 bg-red-50 text-red-800 [&_[data-icon]_svg]:!text-red-500",
    warning:
      "border-orange-200 bg-orange-50 text-orange-800 [&_[data-icon]_svg]:!text-orange-500",
    info: "border-blue-200 bg-blue-50 text-blue-800 [&_[data-icon]_svg]:!text-blue-500",
  },
};

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
