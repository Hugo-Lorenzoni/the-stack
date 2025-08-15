"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { Menu } from "lucide-react";

export default function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  useEffect(() => {
    if (open) {
      // console.log(path);
      setOpen(false);
    }
  }, [path]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="xl:hidden">
        <Menu />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent className="border-orange-600 bg-orange-600 text-white xl:hidden">
        <SheetHeader>
          <SheetTitle className="mb-8 text-white">Menu</SheetTitle>
        </SheetHeader>
        <div className="px-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
