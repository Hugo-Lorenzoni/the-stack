import Link from "next/link";
import AuthButton from "./AuthButton";
// import { useSession } from "next-auth/react";
import SearchBar from "./SearchBar";
import { getNextAuthSession } from "@/utils/auth";
import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLUListElement>;

export default async function NavLinks({ className }: Props) {
  // const { data: session } = useSession();
  const session = await getNextAuthSession();

  const linkStyle =
    "relative after:absolute after:bg-white after:w-0 after:h-[0.15rem] after:-bottom-1 after:left-0 after:rounded-full hover:after:w-full after:duration-500";

  return (
    <ul className={cn("flex flex-col gap-6 xl:flex-row", className)}>
      {session ? (
        <>
          <li className="flex items-center">
            <SearchBar />
          </li>
          <li className="flex items-center">
            <Link className={linkStyle} href="/events">
              Événements ouverts
            </Link>
          </li>
        </>
      ) : (
        <></>
      )}
      {session &&
      (session.user?.role === "BAPTISE" || session.user?.role === "ADMIN") ? (
        <>
          <li className="flex items-center">
            <Link className={linkStyle} href="/fpmsevents">
              Événements baptisés
            </Link>
          </li>
          <li className="flex items-center">
            <Link className={linkStyle} href="/autresevents">
              Autres
            </Link>
          </li>
          <li className="flex items-center">
            <Link className={linkStyle} href="/videos">
              Vidéos
            </Link>
          </li>
        </>
      ) : (
        <li className="flex items-center">
          <Link className={linkStyle} href="/autresevents">
            Autres
          </Link>
        </li>
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
      <li className="flex items-center justify-start">
        <AuthButton session={session} />
      </li>
    </ul>
  );
}
