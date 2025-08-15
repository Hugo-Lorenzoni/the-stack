import { getInfos } from "@/utils/getInfos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default async function AdminPage() {
  const infos = await getInfos();
  return (
    <section>
      <h2 className="mb-4">
        Bienvenue sur le tableau de bord de la gestion du site CPV !
      </h2>
      <h3 className="mb-2">Quelques infos sur le site :</h3>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Photos
              <Picture strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countPhoto} photos</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Utilisateurs
              <UserCircle strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countUser} utilisateurs</p>
            <p className="italic text-orange-500">
              ({infos.countWaitingUser} en attente d&apos;approbation)
            </p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Événements ouverts
              <Users2 strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventOuvert} événements ouverts</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Événements baptisés
              <BadgeCheck strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventFpms} événements baptisés</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Autres événements
              <Lock strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countEventAutre} autres événements</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Vidéos
              <Video strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{infos.countVideo} vidéos</p>
          </CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex justify-between gap-2">
              Stockage
              <DatabaseBackup strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="pb-1">{infos.formatedSize} / 2000 Go</p>
            <Progress value={(infos.formatedSize / 2000) * 100} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
