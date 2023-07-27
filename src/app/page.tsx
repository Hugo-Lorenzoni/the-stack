import Image from "next/image";

export default function Home() {
  return (
    <main>
      <section className="h-[calc(100vh_-_10rem)] overflow-hidden relative">
        <Image
          className="object-cover w-full h-full"
          src="/statue-houdain.jpg"
          width={4000}
          height={2667}
          alt="Statue de Houdain FPMs"
          quality={70}
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
            À propos
          </h2>
          <p>
            Ce site est le site officiel du Cercle Photo-Vidéo de la Faculté
            Polytechnique de Mons.
          </p>
          <p>
            Nos photos sont prises à but non lucratif et visent uniquement à
            illustrer et à figer dans le temps les évènements organisés par les
            étudiants de cette même Faculté. Les photos sont sous la protection
            d'un mot de passe par respect de la vie privée.
          </p>
          <p>Pour toutes questions, n'hésitez pas à nous contacter !</p>
          <p className="text-end"> Le Cercle Photo-Vidéo (CPV)</p>
          <p className="text-end italic"> Mars 2023.</p>
        </div>
      </section>
    </main>
  );
}
