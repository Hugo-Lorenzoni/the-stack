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
import getFolderSize from "get-folder-size";
import { DatabaseBackup, Video } from "lucide-react";
import { join } from "path";
import { env } from "process";

export async function VideosCard() {
  const countVideo = await prisma.video.count();
  return (
    <Card className="gap-3 border-2">
      <CardHeader>
        <CardTitle className="flex justify-between gap-2">
          Vidéos
          <Video strokeWidth={2.25} />
        </CardTitle>
        <CardDescription>Nombres de vidéos</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{countVideo} vidéos</p>
      </CardContent>
    </Card>
  );
}

export function LoadingVideosCard() {
  return (
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
  );
}
