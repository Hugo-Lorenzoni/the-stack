import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";

export default function Nav() {
  return (
    <footer className="bg-orange-600 py-4 text-white">
      <div className="container flex flex-col gap-4">
        <Link
          href="/"
          className="flex bold font-semibold text-4xl items-center gap-2 mx-auto w-fit"
        >
          <Image
            src="/cpv-logo.png"
            width={50}
            height={50}
            alt="CPV FPMs logo"
          />
          CPV
        </Link>
        <div className="grid grid-cols-3 gap-4 is">
          <div>
            <h4 className="font-semibold text-xl pb-2">Réseaux sociaux</h4>
            <ul>
              <li className="transition-transform hover:translate-x-1 motion-reduce:transform-none">
                <a
                  className="flex gap-2 items-center"
                  href="https://www.instagram.com/cpvfpms/"
                >
                  <Instagram />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xl pb-2">Comité CPV</h4>
            <ul>
              <li>Rodrigue Deghorain</li>
              <li>Marithé Hupin</li>
              <li>Janelle Merlevede</li>
              <li>Sarah Gilles</li>
              <li>Guillaume Chamart</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-xl pb-2">© Site développé par</h4>
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
