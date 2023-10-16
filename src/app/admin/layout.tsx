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
  const linkStyle =
    "hover:bg-neutral-100 py-2 px-4 rounded-md duration-150 snap-start";
  const activeStyle = "bg-neutral-200" + " " + linkStyle;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh_-_10rem)]">
      <aside className="p-2 lg:p-4 lg:min-w-fit lg:w-fit w-full font-semibold flex flex-row lg:flex-col whitespace-nowrap overflow-x-scroll lg:overflow-auto gap-2 lg:shadow-2xl scroll-ml-0 snap-x snap-mandatory scroll-px-2">
        <Link
          className={currentRoute === "/admin" ? activeStyle : linkStyle}
          href="/admin"
        >
          Tableau de bord
        </Link>
        <ResponsiveSeparator />
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
        <ResponsiveSeparator />
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
        <ResponsiveSeparator />
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
        <ResponsiveSeparator />
        <Link
          className={
            currentRoute === "/admin/new-video" ? activeStyle : linkStyle
          }
          href="/admin/new-video"
        >
          Nouvelle vidéo
        </Link>
        <Link
          className={
            currentRoute === "/admin/videos-management"
              ? activeStyle
              : linkStyle
          }
          href="/admin/videos-management"
        >
          Gestion des vidéos
        </Link>
        <ResponsiveSeparator />
        <Link
          className={currentRoute === "/admin/comite" ? activeStyle : linkStyle}
          href="/admin/comite"
        >
          Comité
        </Link>
        <Link
          className={
            currentRoute === "/admin/text-intro" ? activeStyle : linkStyle
          }
          href="/admin/text-intro"
        >
          Texte d&apos;introduction
        </Link>
      </aside>
      <main className="my-8 md:px-14 px-4 grow flex flex-col overflow-x-auto">
        <h1 className="font-semibold text-2xl">Admin Dashboard</h1>
        {children}
      </main>
    </div>
  );
}

function ResponsiveSeparator() {
  return (
    <>
      <Separator className="hidden lg:block" />
      <Separator orientation="vertical" className="lg:hidden h-auto" />
    </>
  );
}
