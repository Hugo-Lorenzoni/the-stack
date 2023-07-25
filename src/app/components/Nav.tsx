import Link from "next/link";
import Image from "next/image";

export default function Nav() {
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
            <Link href="/events">Événements ouverts</Link>
          </li>
          <li>
            <Link href="/fpmsevents">Événements baptisés</Link>
          </li>
          <li>
            <Link href="/admin">CPV</Link>
          </li>
          <li>Connexion</li>
        </ul>
      </nav>
    </header>
  );
}
