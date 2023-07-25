import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";

export default function Nav() {
  const linkStyle =
    "relative after:absolute after:bg-white after:w-0 after:h-[0.2rem] after:-bottom-1 after:left-0 after:rounded-full hover:after:w-full after:duration-500";

  return (
    <header className="bg-orange-600 text-white">
      <nav className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between font-semibold text-xl">
        <Link href="/" className="flex text-4xl items-center gap-2">
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
          <li>
            <Link className={linkStyle} href="/events">
              Événements ouverts
            </Link>
          </li>
          <li>
            <Link className={linkStyle} href="/fpmsevents">
              Événements baptisés
            </Link>
          </li>
          <li>
            <Link className={linkStyle} href="/admin">
              CPV
            </Link>
          </li>
          <li>
            <AuthButton />
          </li>
        </ul>
      </nav>
    </header>
  );
}
