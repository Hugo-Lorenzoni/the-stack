import { getInfos } from "@/utils/getInfos";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BadgeCheck,
  Image as Picture,
  UserCircle,
  Users2,
  Lock,
  Video,
  DatabaseBackup,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { LoadingStorageCard, StorageCard } from "./StorageCard";
import { Suspense } from "react";
import { LoadingVideosCard, VideosCard } from "./VideosCard";
import { LoadingPhotosCard, PhotosCard } from "./PhotosCard";
import { EventsCard, LoadingEventsCard } from "./EventsCard";

export default async function AdminPage() {
  // const infos = await getInfos();

  return (
    <section>
      <h2 className="mb-4">
        Bienvenue sur le tableau de bord de la gestion du site CPV !
      </h2>
      <h3 className="mb-2">Quelques infos sur le site :</h3>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Suspense fallback={<LoadingPhotosCard />}>
          <PhotosCard />
        </Suspense>
        {/* <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Utilisateurs
              <UserCircle strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>Nombres de comptes utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countUser} utilisateurs</p>
            <p className="text-orange-500 italic">
              ({infos.countWaitingUser} en attente d&apos;approbation)
            </p>
          </CardContent>
        </Card> */}
        <Suspense fallback={<LoadingEventsCard />}>
          <EventsCard />
        </Suspense>
        <Suspense fallback={<LoadingVideosCard />}>
          <VideosCard />
        </Suspense>
        <Suspense fallback={<LoadingStorageCard />}>
          <StorageCard />
        </Suspense>
      </div>
    </section>
  );
}
