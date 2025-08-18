"use client";

import { Photo } from "@prisma/client";

import { Dispatch, memo, SetStateAction, useState } from "react";

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

import { toast } from "sonner";

import { Loader2, Plus } from "lucide-react";

type Props = {
  photo: Photo;
  photos: Photo[];
  setPhotos: Dispatch<SetStateAction<Photo[]>>;
};

const DeletePhotoButton = memo(function DeletePhotoButton({
  photo,
  photos,
  setPhotos,
}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  async function deletePhoto(
    e: React.MouseEvent<HTMLButtonElement>,
    photo: Photo,
  ) {
    e.preventDefault();
    setLoading(true);
    console.log(photo);
    try {
      const apiUrlEndpoint = "/api/admin/deletephoto";
      const postData = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photo),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const name = await response.json();
        toast.success("Suppression de la photo réussie", {
          description: `${name} a été supprimé !`,
        });
        if (photos !== null) {
          setPhotos((prevPhotos: Photo[]) =>
            prevPhotos.filter((prevPhoto) => prevPhoto.id !== photo.id),
          );
        }
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setModalOpen(false);
  }
  return (
    <AlertDialog onOpenChange={setModalOpen} open={isModalOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="destructive"
          className="absolute top-4 right-4 z-10 hidden items-center justify-center bg-red-600 p-2 duration-100 group-hover:flex hover:bg-red-500"
        >
          <div className="flex size-5 items-center justify-center">
            <Plus className="flex rotate-45 items-center justify-center" />
          </div>
          <span className="sr-only text-lg">Delete</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Êtes-vous sûr de vouloir supprimer cette photo ?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Cette suppression est irréversible. Cette photo sera supprimée de
            manière permanente de cet événement.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-500"
            onClick={(e) => deletePhoto(e, photo)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="size-4 animate-spin text-white"
                />
                En cours
              </>
            ) : (
              "Supprimer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
});

export default DeletePhotoButton;
