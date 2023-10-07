"use client";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function Waiting() {
  const { data: session } = useSession();
  const [clicked, setClicked] = useState(false);

  function handelClick(validationCode: string) {
    navigator.clipboard.writeText(validationCode);
    setClicked(true);
  }

  if (session && session.user && session.user.role == "WAITING") {
    const validationCode = session.user.id.substring(0, 8);

    return (
      <main className=" max-w-3xl mx-auto px-6 pb-40 min-h-[calc(100vh_-_10rem)] flex items-center justify-center">
        <section className="space-y-4 border-2 border-orange-600 rounded-2xl p-4 mt-4">
          <h1 className="font-semibold text-2xl">
            Votre comptre est en attente d&apos;approbation
          </h1>
          <p>
            Afin de permettre la vérification de votre comptre,{" "}
            <b>
              veuillez envoyer votre code de validation par message au{" "}
              <a
                className="underline"
                href="https://www.instagram.com/cpvfpms/"
              >
                compte Instagram du CPV
              </a>
            </b>{" "}
            (Cercle Photo Vidéo FPMs) ou bien à un membre du comité sur
            Facebook/Messenger.
          </p>
          <p>Code de validation : {validationCode}</p>
          <Button variant="outline" onClick={() => handelClick(validationCode)}>
            {clicked ? <Check className="mr-2" /> : <Copy className="mr-2" />}
            Copier ce code dans le presse-papier
          </Button>
          <p className="text-orange-600">
            Ce code nous permettra de vérifier votre identité pour éviter toute
            usurpation de celle-ci.
          </p>
          <p className="italic">
            Remarque : Dans le cas où vous perdriez ce code, celui-ci est
            disponible en cliquant sur votre photo de profil
          </p>
        </section>
      </main>
    );
  }
}
