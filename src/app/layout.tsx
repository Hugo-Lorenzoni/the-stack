import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";

import Nav from "./components/Nav";

const inter = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Nav />
        {children}
      </body>
    </html>
  );
}
