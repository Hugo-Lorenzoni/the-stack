import AutreEvent from "@/app/autresevents/[id]/AutreEvent";
import { getAutreEvent } from "@/utils/getAutreEvent";
import { getInfoAutreEvent } from "@/utils/getInfoAutreEvent";
import { decrypt } from "@/utils/encryption";
import { cookies } from "next/headers";
import { getNextAuthSession } from "@/utils/auth";

export default async function AutreEventPage({
  params,
}: {
  params: { id: string };
}) {
  
  // console.log(cookie);
  const session = await getNextAuthSession();

  const info = await getInfoAutreEvent(params.id);
  // console.log(info);

  if (session?.user?.role === "ADMIN") {
    const event = await getAutreEvent(params.id);
    return <AutreEvent info={info} event={event} />;
  } else {
    const cookieStore = cookies();
    const cookie = cookieStore.get(params.id);
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
  }
  

  return <AutreEvent info={info} event={null} />;
}
