import Link from "@/components/Link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { getComite } from "@/utils/getComite";

// import path from "path";
// import { promises as fs } from "fs";

// export const revalidate = 60 * 60 * 24; // revalidate at most every day

export default async function Footer() {
  const comite = await getComite();

  return (
    <footer className="relative z-10 bg-orange-600 py-4 text-white">
      <div className="container flex flex-col gap-4">
        <Link
          href="/"
          className="bold mx-auto flex w-fit items-center gap-2 text-4xl font-semibold"
        >
          <Image
            src="/cpv-logo.png"
            width={50}
            height={50}
            alt="CPV FPMs logo"
          />
          CPV
        </Link>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
          <div>
            <h4 className="pb-2 text-xl font-semibold">Réseaux sociaux</h4>
            <ul>
              <li className="transition-transform hover:translate-x-1 motion-reduce:transform-none">
                <a
                  className="flex items-center gap-2"
                  href="https://www.instagram.com/cpvfpms/"
                >
                  <Instagram />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="pb-2 text-xl font-semibold">Comité CPV</h4>
            <ul>
              <li>{comite.president}</li>
              <li>{comite.responsableVideo}</li>
              <li>{comite.responsablePhoto}</li>
              <li>{comite.delegueVideo}</li>
              <li>{comite.deleguePhoto}</li>
            </ul>
          </div>
          <div>
            <h4 className="pb-2 text-xl font-semibold">
              © Site développé par
            </h4>
            <ul>
              <li>Hugo Lorenzoni</li>
              <li>Rodrigue Deghorain</li>
              <li>Rémy Lempire</li>
            </ul>
          </div>
        </div>
        <h5 className="text-center">
          Un site réalisé en partie dans le cadre du cours de Modélisation des
          données, Big Data et projet.
        </h5>
      </div>
    </footer>
  );
}
