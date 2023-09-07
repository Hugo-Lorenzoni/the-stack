import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from "lucide-react";

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
        <Sheet>
          <SheetTrigger className="xl:hidden ">
            <Menu />
            <span className="sr-only">Menu</span>
          </SheetTrigger>
          <SheetContent className="xl:hidden bg-orange-600 text-white">
            <SheetHeader>
              <SheetTitle className="text-white mb-8">Menu</SheetTitle>
            </SheetHeader>
            <NavLinks />
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
