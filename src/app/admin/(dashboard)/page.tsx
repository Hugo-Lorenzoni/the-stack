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

export default async function AdminPage() {
  const infos = await getInfos();

  const totalCount =
    infos.countEventOuvert + infos.countEventFpms + infos.countEventAutre;
  return (
    <section>
      <h2 className="mb-4">
        Bienvenue sur le tableau de bord de la gestion du site CPV !
      </h2>
      <h3 className="mb-2">Quelques infos sur le site :</h3>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Photos
              <Picture strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>Nombres de photos</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countPhoto} photos</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
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
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Événements ouverts
              <Users2 strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              {((infos.countEventOuvert / totalCount) * 100).toFixed()}% des
              événements sont ouverts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventOuvert} événements ouverts</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Événements baptisés
              <BadgeCheck strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              {((infos.countEventFpms / totalCount) * 100).toFixed()}% des
              événements sont baptisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventFpms} événements baptisés</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Autres événements
              <Lock strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              {((infos.countEventAutre / totalCount) * 100).toFixed()}% des
              événements sont autres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventAutre} autres événements</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Vidéos
              <Video strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>Nombres de vidéos</CardDescription>
          </CardHeader>
          <CardContent>
            <p>{infos.countVideo} vidéos</p>
          </CardContent>
        </Card>
        <Suspense fallback={<LoadingStorageCard />}>
          <StorageCard />
        </Suspense>
      </div>
    </section>
  );
}
