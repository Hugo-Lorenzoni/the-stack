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

  // const jsonDirectory = path.join(process.cwd(), "src/data");
  // //Read the json data file data.json
  // const fileContents = await fs.readFile(
  //   jsonDirectory + "/text-intro.json",
  //   "utf8"
  // );
  // const textintro: TextIntro = JSON.parse(fileContents);
  // console.log(textintro);

  // const textintro = {
  //   title: "À propos",
  //   text: [
  //     "Ce site est le site officiel du Cercle Photo-Vidéo de la Faculté Polytechnique de Mons.",
  //     "Nos photos sont prises à but non lucratif et visent uniquement à illustrer et à figer dans le temps les évènements organisés par les étudiants de cette même Faculté. Les photos sont sous la protection d'un mot de passe par respect de la vie privée.",
  //     "Pour toutes questions, n'hésitez pas à nous contacter !",
  //   ],
  //   signature: "Le Cercle Photo-Vidéo (CPV)",
  //   date: "Août 2023",
  // };

  return (
    <main>
      <section className="relative h-[calc(100vh_-_10rem)] overflow-hidden">
        <Image
          className="relative -z-10 h-full w-full object-cover"
          src="/statue-houdain.jpg"
          width={4000}
          height={2667}
          alt="Statue de Houdain FPMs"
          quality={50}
          priority
        />
        <h1 className="absolute bottom-12 left-[15%] right-[15%] z-0 pr-[15%] text-4xl font-bold text-white drop-shadow-title">
          Bienvenue sur le site du Cercle Photo-Vidéo de la Faculté
          Polytechnique de Mons !
        </h1>
      </section>
      <section className="container py-4">
        <div className="rounded-2xl border-4 border-orange-600 px-6 py-4 shadow-lg">
          <h2 className="relative mb-4 w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
            {textintro.title}
          </h2>
          {textintro.text.map((p, i) => (
            <p key={i}>{p}</p>
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
          Retrouver nos précédentes photos sur notre ancien site.
        </a>
      </section>
    </main>
  );
}
