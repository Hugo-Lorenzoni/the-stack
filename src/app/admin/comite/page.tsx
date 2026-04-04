import ComiteForm from "@/app/admin/comite/ComiteForm";
import { getNewComite } from "@/utils/getNewComite";
import { getRequestLogger } from "@/lib/getRequestLogger";

export const dynamic = "force-dynamic";

export type Comite = {
  president: string;
  responsableVideo: string;
  responsablePhoto: string;
  delegueVideo: string;
  deleguePhoto: string;
};

export default async function ComitePage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/comite");

  let comite: Comite = {
    president: "",
    responsableVideo: "",
    responsablePhoto: "",
    delegueVideo: "",
    deleguePhoto: "",
  };

  try {
    comite = await getNewComite();
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
      <h2>Modification du comité</h2>
      <ComiteForm comite={comite} />
    </>
  );
}
