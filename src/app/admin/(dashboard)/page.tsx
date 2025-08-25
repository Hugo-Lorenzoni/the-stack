import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getInfos } from "@/utils/getInfos";
import {
  BadgeCheck,
  DatabaseBackup,
  Lock,
  Image as Picture,
  UserCircle,
  Users2,
  Video,
} from "lucide-react";
import { after } from "next/server";

export default async function AdminPage() {
  const {
    userCount,
    waitingUserCount,
    photoCount,
    eventOuvertCount,
    eventFpmsCount,
    eventAutreCount,
    totalCount,
    videoCount,
    storageUsed,
  } = await getInfos();

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
            <p>{photoCount} photos</p>
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
            <p>{userCount} utilisateurs</p>
            <p className="text-orange-500 italic">
              ({waitingUserCount} en attente d&apos;approbation)
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
              {((eventOuvertCount / totalCount) * 100).toFixed()}% des
              événements sont ouverts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{eventOuvertCount} événements ouverts</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Événements baptisés
              <BadgeCheck strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              {((eventFpmsCount / totalCount) * 100).toFixed()}% des événements
              sont baptisés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{eventFpmsCount} événements baptisés</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Autres événements
              <Lock strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              {((eventAutreCount / totalCount) * 100).toFixed()}% des événements
              sont autres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>{eventAutreCount} autres événements</p>
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
            <p>{videoCount} vidéos</p>
          </CardContent>
        </Card>
        <Card className="gap-3 border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Stockage
              <DatabaseBackup strokeWidth={2.25} />
            </CardTitle>
            <CardDescription>
              Espace de stockage utilisé par les photos sur le NAS du Magellan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="pb-1">{storageUsed} / 2000 Go</p>
            <Progress value={(storageUsed / 2000) * 100} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
