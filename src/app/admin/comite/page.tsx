import ComiteForm from "@/app/admin/comite/ComiteForm";
import { getNewComite } from "@/utils/getNewComite";

export const dynamic = "force-dynamic";

export type Comite = {
  president: string;
  responsableVideo: string;
  responsablePhoto: string;
  delegueVideo: string;
  deleguePhoto: string;
};

export default async function ComitePage() {
  const comite: Comite = await getNewComite();
  return (
    <>
      <h2>Modification du comité</h2>
      <ComiteForm comite={comite} />
    </>
  );
}
