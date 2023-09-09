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
      console.log(path);
      setOpen(false);
    }
  }, [path]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="xl:hidden ">
        <Menu />
        <span className="sr-only">Menu</span>
      </SheetTrigger>
      <SheetContent className="xl:hidden bg-orange-600 text-white">
        <SheetHeader>
          <SheetTitle className="text-white mb-8">Menu</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
