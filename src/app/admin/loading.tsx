import { getInfos } from "@/utils/getInfos";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeCheck,
  Image,
  UserCircle,
  Users2,
  Lock,
  Video,
  DatabaseBackup,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
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
              <Image strokeWidth={2.25} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="mb-2 h-4 w-full" />
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
            <Skeleton className="mb-2 h-4 w-full" />

            <Skeleton className="mb-2 h-4 w-1/2" />
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
            <Skeleton className="mb-2 h-4 w-full" />
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
            <Skeleton className="mb-2 h-4 w-full" />
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
            <Skeleton className="mb-2 h-4 w-full" />
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
            <Skeleton className="mb-2 h-4 w-full" />
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
            <Skeleton className="mb-2 h-4 w-full" />

            <Progress value={0} />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
