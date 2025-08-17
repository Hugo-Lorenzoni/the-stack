import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Trash } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  eventId: string;
};

export default function DownloadAllPicturesButton({ eventId }: Props) {
  const [isDownloading, setDownloading] = useState<boolean>(false);
  const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);

  const router = useRouter();

  async function downloadAllPictures(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDownloading(true);
    try {
      const response = await fetch(
        `/api/admin/downloadallpictures/${eventId}`,
        {
          method: "GET",
        },
      );
      console.log(response);

      if (response.status == 200) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          response.headers
            .get("Content-Disposition")
            ?.match(/filename="(.+)"/)?.[1] || "archive.zip";
        link.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }

    setConfirmationModalOpen(false);
    setDownloading(false);
  }

  return (
    <AlertDialog
      onOpenChange={setConfirmationModalOpen}
      open={isConfirmationModalOpen}
    >
      <AlertDialogTrigger asChild>
        <Button>
          <Download className="size-4" /> Télécharger toutes les photos
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir télécharger toutes les photos de cet
            événement ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Ce téléchargement va créer une archive ZIP contenant toutes les
            photos de l&apos;événement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDownloading}>
            Annuler
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => downloadAllPictures(e)}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="h-4 w-4 animate-spin text-white"
                />
                En cours de téléchargement...
              </>
            ) : (
              "Télécharger"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
