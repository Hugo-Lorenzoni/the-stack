"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  {
    /* Get the current route */
  }
  const currentRoute = usePathname();
  const linkStyle = "hover:bg-neutral-200 py-2 px-4 rounded-md duration-150";
  const activeStyle = "bg-neutral-200" + " " + linkStyle;

  return (
    <section className="flex min-h-screen">
      <aside className="bg-neutral-50 p-4 font-semibold flex flex-col gap-2">
        <Link
          className={
            currentRoute === "/admin/new-event" ? activeStyle : linkStyle
          }
          href="/admin/new-event"
        >
          Créer un nouvel événement
        </Link>

        <Link
          className={
            currentRoute === "/admin/accounts-approval"
              ? activeStyle
              : linkStyle
          }
          href="/admin/accounts-approval"
        >
          Approbation des comptes
        </Link>

        <Link
          className={
            currentRoute === "/admin/accounts-management"
              ? activeStyle
              : linkStyle
          }
          href="/admin/accounts-management"
        >
          Gestion des comptes
        </Link>
      </aside>
      <main className="m-6">
        <h1 className="font-semibold text-2xl">Admin Dashboard</h1>
        {children}
      </main>
    </section>
  );
}
