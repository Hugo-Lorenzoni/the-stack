"use client";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import { useSession } from "next-auth/react";

export default function Nav() {
  const { data: session } = useSession();
  console.log(session);

  const linkStyle =
    "relative after:absolute after:bg-white after:w-0 after:h-[0.15rem] after:-bottom-1 after:left-0 after:rounded-full hover:after:w-full after:duration-500";

  return (
    <header className="bg-orange-600 text-white font-semibold">
      <nav className="container h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex text-4xl font-bold items-center gap-2 hover:opacity-90 duration-150"
        >
          <Image
            src="/cpv-logo.png"
            width={50}
            height={50}
            alt="CPV FPMs logo"
            priority
          />
          CPV
        </Link>
        <ul className="flex gap-6">
          <li className="flex items-center">
            <Link className={linkStyle} href="/events">
              Événements ouverts
            </Link>
          </li>
          {session &&
          (session.user?.role === "BAPTISE" ||
            session.user?.role === "ADMIN") ? (
            <li className="flex items-center">
              <Link className={linkStyle} href="/fpmsevents">
                Événements baptisés
              </Link>
            </li>
          ) : (
            <></>
          )}
          {session && session.user?.role === "ADMIN" ? (
            <li className="flex items-center">
              <Link className={linkStyle} href="/admin">
                CPV
              </Link>
            </li>
          ) : (
            <></>
          )}

          <li className="flex items-center">
            <AuthButton session={session} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
