"use client";

import { Photo } from "@prisma/client";
import { Dispatch, SetStateAction, useState } from "react";

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
import { useToast } from "./ui/use-toast";
import Image from "next/image";
import { Button } from "./ui/button";
import { Loader2, Plus } from "lucide-react";

type Props = {
  photo: Photo;
  index: number;
  photos: Photo[];
  setPhotos: Dispatch<SetStateAction<Photo[]>>;
  openLightbox: (photo: Photo, index: number) => void;
  eventName: string;
};

export default function AdminGalleryPhoto({
  photo,
  index,
  photos,
  setPhotos,
  openLightbox,
  eventName,
}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isLoading, setLoading] = useState<boolean>(false);

  const { toast } = useToast();

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
      if (response.status == 500) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
      }
      if (response.status == 200) {
        const name = await response.json();
        toast({
          variant: "default",
          title: "Suppression de la photo réussie",
          description: `${name} a été supprimé !`,
        });
        if (photos !== null) {
          setPhotos((prevPhotos: Photo[]) =>
            prevPhotos.filter((prevPhoto) => prevPhoto.id !== photo.id),
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setModalOpen(false);
  }
  return (
    <li
      className={`group relative cursor-pointer overflow-hidden rounded-md ${
        photo.width < photo.height
          ? "row-span-2"
          : index % 7
          ? ""
          : "row-span-2 md:col-span-2"
      }`}
    >
      <AlertDialog onOpenChange={setModalOpen} open={isModalOpen}>
        <AlertDialogTrigger asChild>
          <Button className="absolute right-4 top-4 hidden rounded-lg bg-red-600 p-2 pl-[7px] hover:bg-red-500 group-hover:flex">
            <Plus className="rotate-45" />
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
                    className="mr-2 h-4 w-4 animate-spin text-white"
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
      <Image
        className="h-full w-full object-cover"
        src={photo.url}
        width={photo.width}
        height={photo.height}
        alt={eventName}
        quality={10}
        onClick={() => openLightbox(photo, index)}
      />
    </li>
  );
}
