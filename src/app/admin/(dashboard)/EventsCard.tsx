import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { BadgeCheck, DatabaseBackup, Lock, Users2 } from "lucide-react";

export async function EventsCard() {
  const eventCounts = await prisma.event.groupBy({
    by: ["type"],
    _count: { id: true },
    where: { type: { in: ["OUVERT", "BAPTISE", "AUTRE"] } },
  });
  const countEventOuvert =
    eventCounts.find((e) => e.type === "OUVERT")?._count.id || 0;
  const countEventFpms =
    eventCounts.find((e) => e.type === "BAPTISE")?._count.id || 0;
  const countEventAutre =
    eventCounts.find((e) => e.type === "AUTRE")?._count.id || 0;

  //   const [countEventOuvert, countEventFpms, countEventAutre] = await Promise.all(
  //     [
  //       prisma.event.count({ where: { type: "OUVERT" } }),
  //       prisma.event.count({ where: { type: "BAPTISE" } }),
  //       prisma.event.count({ where: { type: "AUTRE" } }),
  //     ],
  //   );
  const totalCount = countEventOuvert + countEventFpms + countEventAutre;

  return (
    <>
      <Card className="gap-3 border-2">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2">
            Événements ouverts
            <Users2 strokeWidth={2.25} />
          </CardTitle>
          <CardDescription>
            {((countEventOuvert / totalCount) * 100).toFixed()}% des événements
            sont ouverts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{countEventOuvert} événements ouverts</p>
        </CardContent>
      </Card>
      <Card className="gap-3 border-2">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2">
            Événements baptisés
            <BadgeCheck strokeWidth={2.25} />
          </CardTitle>
          <CardDescription>
            {((countEventFpms / totalCount) * 100).toFixed()}% des événements
            sont baptisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{countEventFpms} événements baptisés</p>
        </CardContent>
      </Card>
      <Card className="gap-3 border-2">
        <CardHeader>
          <CardTitle className="flex justify-between gap-2">
            Autres événements
            <Lock strokeWidth={2.25} />
          </CardTitle>
          <CardDescription>
            {((countEventAutre / totalCount) * 100).toFixed()}% des événements
            sont autres
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>{countEventAutre} autres événements</p>
        </CardContent>
      </Card>
    </>
  );
}

export function LoadingEventsCard() {
  return (
    <>
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
    </>
  );
}
