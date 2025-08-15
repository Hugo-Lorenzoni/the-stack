"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, CopyCheck, Eye, EyeOff } from "lucide-react";

type Props = {
  password: string;
};

export default function Password({ password }: Props) {
  const [showPassword, setShowPassword] = useState("password");
  const [passwordCopied, setPasswordCopied] = useState(false);

  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="relative max-w-sm">
        <Input
          className="pr-16"
          type={showPassword}
          placeholder="Mot de passe"
          value={password}
          readOnly
        />
        <Button
          type="button"
          variant="outline"
          className="absolute right-0 bottom-0"
          onClick={() =>
            setShowPassword((prev) =>
              prev == "password" ? "text" : "password",
            )
          }
        >
          {showPassword == "password" ? (
            <>
              <span className="sr-only mr-2">Show password</span>
              <Eye />
            </>
          ) : (
            <>
              <span className="sr-only mr-2">Hide password</span>
              <EyeOff />
            </>
          )}
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          navigator.clipboard.writeText(password);
          setPasswordCopied(true);
          setTimeout(() => setPasswordCopied(false), 3000);
        }}
      >
        {!passwordCopied ? (
          <>
            Copier
            <span>
              <Copy />
            </span>
          </>
        ) : (
          <>
            Copié
            <span>
              <CopyCheck />
            </span>
          </>
        )}
      </Button>
    </div>
  );
}
