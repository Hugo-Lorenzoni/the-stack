"use client";
import { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Copy } from "lucide-react";

export default function AuthButton({ session }: { session: Session | null }) {
  if (session && session.user) {
    const validationCode = session.user.id.substring(0, 8);
    return (
      <div className="flex gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center duration-150 ease-in-out hover:opacity-80">
            <Avatar>
              <AvatarFallback className="text-xs font-semibold text-orange-600">
                {Array.from(`${session.user.name}`)[0].toUpperCase() +
                  Array.from(`${session.user.surname}`)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="ml-4 xl:hidden">
              {session.user.name} {session.user.surname}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="shadow-md" align="end">
            <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
            <DropdownMenuItem>
              <Button
                onClick={() => {
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full"
              >
                Déconnexion
              </Button>
            </DropdownMenuItem>
            {session.user.role == "WAITING" && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Code de validation</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Button
                    variant="outline"
                    onClick={() =>
                      navigator.clipboard.writeText(validationCode)
                    }
                    className="w-full"
                  >
                    <Copy />
                    {validationCode}
                  </Button>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-4">
      <Button
        className="hover:bg-opacity-90 bg-white font-semibold text-orange-600 hover:bg-white"
        onClick={() => signIn()}
      >
        Se connecter
      </Button>
      <Button
        className="border-2 bg-orange-600 font-semibold text-white hover:bg-orange-500"
        asChild
      >
        <Link href="/register">Créer un compte</Link>
      </Button>
    </div>
  );
}
