import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import getFolderSize from "get-folder-size";
import { DatabaseBackup } from "lucide-react";
import { join } from "path";
import { env } from "process";

export async function StorageCard() {
  const size = await getFolderSize.loose(join(env.DATA_FOLDER, "photos"));
  const formatedSize = Number((size / 1000 / 1000 / 1000).toFixed(2));
  return (
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
        <p className="pb-1">{formatedSize} / 2000 Go</p>
        <Progress value={(formatedSize / 2000) * 100} />
      </CardContent>
    </Card>
  );
}

export function LoadingStorageCard() {
  return (
    <Card className="border-2">
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
        <Skeleton className="mb-2 h-4 w-full" />
        <Progress value={0} />
      </CardContent>
    </Card>
  );
}
