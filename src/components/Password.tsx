"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

type Props = {
  password: string;
};

export default function Password({ password }: Props) {
  const [showPassword, setShowPassword] = useState("password");

  return (
    <div className="relative max-w-sm mt-4">
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
          setShowPassword((prev) => (prev == "password" ? "text" : "password"))
        }
      >
        {showPassword == "password" ? (
          <>
            <span className="mr-2 sr-only">Show password</span>
            <Eye />
          </>
        ) : (
          <>
            <span className="mr-2 sr-only">Hide password</span>
            <EyeOff />
          </>
        )}
      </Button>
    </div>
  );
}
