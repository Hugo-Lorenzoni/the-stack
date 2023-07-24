import Link from "next/link";
import Image from "next/image";

export default async function Nav() {
  return (
    <header className="bg-orange-600">
      <nav className="max-w-7xl mx-auto h-20 flex items-center justify-between font-semibold text-xl ">
        <Link href="/" className="flex text-4xl items-center gap-2">
          <Image
            src="/cpv-logo.png"
            width={50}
            height={50}
            alt="CPV FPMs logo"
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
            <Link href="/events">CPV</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
