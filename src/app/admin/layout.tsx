"use client";

import { Separator } from "@/components/ui/separator";
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
  const linkStyle = "hover:bg-neutral-100 py-2 px-4 rounded-md duration-150";
  const activeStyle = "bg-neutral-200" + " " + linkStyle;

  return (
    <div className="flex min-h-[calc(100vh_-_10rem)]">
      <aside className="p-4 font-semibold flex flex-col gap-2 shadow-2xl">
        <Link
          className={currentRoute === "/admin" ? activeStyle : linkStyle}
          href="/admin"
        >
          Tableau de bord
        </Link>
        <Separator />
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
            currentRoute === "/admin/drafted-events" ? activeStyle : linkStyle
          }
          href="/admin/drafted-events"
        >
          Publication des événements
        </Link>
        <Link
          className={
            currentRoute.includes("/admin/events-management")
              ? activeStyle
              : linkStyle
          }
          href="/admin/events-management"
        >
          Gestion des événements
        </Link>
        <Separator />
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
        <Separator />
        <Link
          className={
            currentRoute === "/admin/new-sponsor" ? activeStyle : linkStyle
          }
          href="/admin/new-sponsor"
        >
          Créer un nouveau sponsor
        </Link>
        <Link
          className={
            currentRoute === "/admin/sponsors-management"
              ? activeStyle
              : linkStyle
          }
          href="/admin/sponsors-management"
        >
          Gestion des sponsors
        </Link>
        <Separator />
        <Link
          className={
            currentRoute === "/admin/new-video" ? activeStyle : linkStyle
          }
          href="/admin/new-video"
        >
          Nouvelle vidéo
        </Link>
        <Separator />
        <Link
          className={currentRoute === "/admin/comite" ? activeStyle : linkStyle}
          href="/admin/comite"
        >
          Modification du comité
        </Link>
        <Link
          className={
            currentRoute === "/admin/text-intro" ? activeStyle : linkStyle
          }
          href="/admin/text-intro"
        >
          Modification du texte d'introduction
        </Link>
      </aside>
      <main className="my-8 mx-14 flex-1 flex flex-col">
        <h1 className="font-semibold text-2xl">Admin Dashboard</h1>
        {children}
      </main>
    </div>
  );
}
