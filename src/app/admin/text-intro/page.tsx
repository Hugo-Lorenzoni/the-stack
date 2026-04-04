import { TextIntro } from "@/app/page";
import TextIntroForm from "@/app/admin/text-intro/TextIntroForm";
import { getNewTextIntro } from "@/utils/getNewTextIntro";
import { getRequestLogger } from "@/lib/getRequestLogger";

export const dynamic = "force-dynamic";

export default async function TextIntroPage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/text-intro");

  let textintro: TextIntro = { title: "", text: [], signature: "", date: "" };

  try {
    textintro = await getNewTextIntro();
    wideEvent.outcome = "success";
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }

  return (
    <>
      <h2>Modification du texte d&apos;introduction</h2>
      <TextIntroForm textintro={textintro} />
    </>
  );
}
