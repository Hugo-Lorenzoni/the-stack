import { TextIntro } from "@/app/page";
import TextIntroForm from "@/components/TextIntroForm";
import { getNewTextIntro } from "@/utils/getNewTextIntro";

export const dynamic = "force-dynamic";

export default async function ComitePage() {
  const textintro: TextIntro = await getNewTextIntro();
  return (
    <>
      <h2>Modification du texte d&apos;introduction</h2>
      <TextIntroForm textintro={textintro} />
    </>
  );
}
