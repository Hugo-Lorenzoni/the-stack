import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";

export default function Nav() {
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
        <NavLinks className="hidden xl:flex" />
        <MobileNav>
          <NavLinks />
        </MobileNav>
      </nav>
    </header>
  );
}
