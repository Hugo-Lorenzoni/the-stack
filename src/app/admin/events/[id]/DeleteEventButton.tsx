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
import { Loader2, Trash } from "lucide-react";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type Props = {
  eventId: string;
};

export default function DeleteEventButton({ eventId }: Props) {
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [isDeleteEventModalOpen, setDeleteEventModalOpen] = useState(false);

  const router = useRouter();

  async function deleteEvent(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/admin/deleteevent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventId),
      });
      console.log(response);

      if (response.status == 200) {
        const name = await response.json();
        toast.success("Suppression de l'événement réussie", {
          description: `${name} a été supprimé !`,
        });
        router.push("/admin/events-management");
        router.refresh();
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }

    setDeleteEventModalOpen(false);
    setDeleteLoading(false);
  }

  return (
    <AlertDialog
      onOpenChange={setDeleteEventModalOpen}
      open={isDeleteEventModalOpen}
    >
      <AlertDialogTrigger asChild>
        <Button className="bg-red-600 hover:bg-red-500">
          <Trash className="size-4" /> Supprimer l&apos;événement
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer cet événement ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette suppression est irréversible. Cet événement et
            l&apos;entièreté des photos associés à celui-ci seront supprimés de
            manière permanente !
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500"
            onClick={(e) => deleteEvent(e)}
            disabled={deleteLoading}
          >
            {deleteLoading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="size-4 animate-spin text-white"
                />
                En cours
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
