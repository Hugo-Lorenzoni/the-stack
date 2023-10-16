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
    <div className="relative mt-4 max-w-sm">
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
        className="absolute bottom-0 right-0"
        onClick={() =>
          setShowPassword((prev) => (prev == "password" ? "text" : "password"))
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
  );
}
