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
    <div className="flex min-h-[calc(100vh-10rem)] flex-col lg:flex-row">
      <aside className="sticky top-20 z-10 flex lg:shadow-2xl">
        <ul className="sticky top-20 flex h-max w-full snap-x snap-mandatory scroll-ml-0 scroll-px-2 flex-row gap-2 overflow-x-scroll bg-white p-2 font-semibold whitespace-nowrap lg:w-fit lg:min-w-fit lg:flex-col lg:overflow-auto lg:p-4">
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
            Nouvel événement
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
          {/* <ResponsiveSeparator />
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
          </Link> */}
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
            className={
              currentRoute === "/admin/comite" ? activeStyle : linkStyle
            }
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
        </ul>
      </aside>
      <main className="my-8 flex grow flex-col overflow-x-auto px-4 md:px-14">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        {children}
      </main>
    </div>
  );
}

function ResponsiveSeparator() {
  return (
    <>
      <div>
        <Separator className="hidden lg:block" />
        <Separator orientation="vertical" className="lg:hidden" />
      </div>
    </>
  );
}
