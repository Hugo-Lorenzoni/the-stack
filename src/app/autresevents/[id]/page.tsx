import AutreEvent from "@/app/autresevents/[id]/AutreEvent";
import { getAutreEvent } from "@/utils/getAutreEvent";
import { getInfoAutreEvent } from "@/utils/getInfoAutreEvent";
import { decrypt } from "@/utils/encryption";
import { cookies } from "next/headers";
import { getNextAuthSession } from "@/utils/auth";

export default async function AutreEventPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(params.id);

  const session = await getNextAuthSession();

  const info = await getInfoAutreEvent(params.id);
  if (cookie?.value) {
    const secret = decrypt(cookie.value);
    if (secret == info?.id) {
      const event = await getAutreEvent(params.id);
      return <AutreEvent info={info} event={event} />;
    } else {
    }
  } else if (session && session.user && session.user.role === "ADMIN") {
    const event = await getAutreEvent(params.id);
    return <AutreEvent info={info} event={event} />;
  }

  return <AutreEvent info={info} event={null} />;
}
