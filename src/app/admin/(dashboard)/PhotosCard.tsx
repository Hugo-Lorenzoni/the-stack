import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import prisma from "@/lib/prisma";
import { Image as Picture } from "lucide-react";

export async function PhotosCard() {
  const countPhoto = await prisma.photo.count();
  return (
    <Card className="gap-3 border-2">
      <CardHeader>
        <CardTitle className="flex justify-between gap-2">
          Photos
          <Picture strokeWidth={2.25} />
        </CardTitle>
        <CardDescription>Nombres de photos</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{countPhoto} photos</p>
      </CardContent>
    </Card>
  );
}

export function LoadingPhotosCard() {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex justify-between gap-2">
          Photos
          <Picture strokeWidth={2.25} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-4 w-full" />
      </CardContent>
    </Card>
  );
}
