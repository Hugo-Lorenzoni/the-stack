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
      <section className="h-[calc(100vh_-_10rem)] overflow-hidden relative">
        <Image
          className="object-cover w-full h-full"
          src="/statue-houdain.jpg"
          width={4000}
          height={2667}
          alt="Statue de Houdain FPMs"
          quality={50}
          priority
        />
        <h1 className="absolute bottom-12 left-[15%] right-[15%] pr-[15%] text-white text-4xl font-bold drop-shadow-title">
          Bienvenue sur le site du Cercle Photo-Vidéo de la Faculté
          Polytechnique de Mons !
        </h1>
      </section>
      <section className="container py-4">
        <div className="px-6 py-4 border-orange-600 border-4 rounded-2xl shadow-lg">
          <h2 className="font-semibold text-2xl mb-4 w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
            {textintro.title}
          </h2>
          {textintro.text.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <p className="text-end">{textintro.signature}</p>
          <p className="text-end italic">{textintro.date}</p>
        </div>
      </section>
      <section className="container py-4 flex">
        <Info className="text-orange-600" />
        <a
          className="underline text-orange-600 ml-2"
          href="https://cerclephotovideofpms.wordpress.com/"
        >
          Retrouver nos précédentes photos sur notre ancien site.
        </a>
      </section>
    </main>
  );
}
