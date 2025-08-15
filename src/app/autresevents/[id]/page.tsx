import AutreEvent from "@/app/autresevents/[id]/AutreEvent";
import { getAutreEvent } from "@/utils/getAutreEvent";
import { getInfoAutreEvent } from "@/utils/getInfoAutreEvent";
import { decrypt } from "@/utils/encryption";
import { cookies } from "next/headers";

export default async function AutreEventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(params.id);
  // console.log(cookie);

  const info = await getInfoAutreEvent(params.id);
  // console.log(info);
  if (cookie?.value) {
    const secret = decrypt(cookie.value);
    if (secret == info?.id) {
      const event = await getAutreEvent(params.id);
      // console.log("Cookie ok");
      return <AutreEvent info={info} event={event} />;
    } else {
      // console.log("Bad cookie");
    }
  }

  return <AutreEvent info={info} event={null} />;
}
