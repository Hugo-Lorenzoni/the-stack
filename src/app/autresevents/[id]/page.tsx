import AutreEvent from "@/components/AutreEvent";
import { getAutreEvent } from "@/utils/getAutreEvent";
import { getInfoAutreEvent } from "@/utils/getInfoAutreEvent";
import { decrypt } from "@/utils/encryption";
import { cookies } from "next/headers";

export default async function AutreEventPage({
  params,
}: {
  params: { id: string };
}) {
  const cookieStore = cookies();
  const cookie = cookieStore.get(params.id);
  console.log(cookie);

  const info = await getInfoAutreEvent(params.id);
  console.log(info);
  if (cookie?.value) {
    const secret = decrypt(cookie.value);
    if (secret == info?.id) {
      const event = await getAutreEvent(params.id);
      console.log("Cookie ok");
      return <AutreEvent info={info} event={event} />;
    } else {
      console.log("Bad cookie");
    }
  }

  return <AutreEvent info={info} event={null} />;
}
