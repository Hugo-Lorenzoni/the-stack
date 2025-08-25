import ImageComponent from "@/components/ImageComponent";
import { getTextIntro } from "@/utils/getTextIntro";
import { Info } from "lucide-react";
import Image from "next/image";

// export const revalidate = 60 * 60 * 24; // revalidate at most every day

export type TextIntro = {
  title: string;
  text: string[];
  signature: string;
  date: string;
};

export default async function Home() {
  const textintro: TextIntro = await getTextIntro();

  return (
    <main>
      <section className="relative h-[calc(100vh-10rem)] overflow-hidden">
        <ImageComponent
          className="relative -z-10 h-full w-full object-cover"
          src="/statue-houdain.jpg"
          width={4000}
          height={2667}
          alt="Statue de Houdain FPMs"
          quality="full"
        />
        <h1 className="drop-shadow-title absolute right-[15%] bottom-12 left-[15%] z-0 pr-[15%] text-4xl font-bold text-white">
          Bienvenue sur le site du Cercle Photo-Vidéo de la Faculté
          Polytechnique de Mons !
        </h1>
      </section>
      <section className="container py-4">
        <div className="rounded-2xl border-4 border-orange-600 px-6 py-4 shadow-lg">
          <h2 className="relative mb-4 w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
            {textintro.title}
          </h2>
          {textintro.text.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="text-end">{textintro.signature}</p>
          <p className="text-end italic">{textintro.date}</p>
        </div>
      </section>
      <section className="container flex py-4">
        <Info className="text-orange-600" />
        <a
          className="ml-2 text-orange-600 underline"
          href="https://cerclephotovideofpms.wordpress.com/"
        >
          Retrouvez nos précédentes photos sur notre ancien site.
        </a>
      </section>
    </main>
  );
}
