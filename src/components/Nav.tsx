import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import MobileNav from "./MobileNav";
import logoCPV from "@public/cpv-logo.png";

export default function Nav() {
  return (
    <header className="sticky top-0 z-20 bg-orange-600 font-semibold text-white">
      <nav className="container flex h-20 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-4xl font-bold duration-150 hover:opacity-90"
        >
          <Image
            src={logoCPV}
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
