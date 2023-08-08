"use client";
import { Photo } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeftCircle,
  ChevronRightCircle,
  Download,
  Loader2,
  Plus,
  XCircle,
} from "lucide-react";
import useSwipe from "../hooks/useSwipe";
import useKeypress from "react-use-keypress";
import { useToast } from "./ui/use-toast";

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

export default function AdminGallery(props: {
  eventName: string;
  photos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(props.photos);

  const [isLoading, setLoading] = useState<boolean>(false);

  const [isOpen, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);

  const [modalIsOpen, setModalOpen] = useState(false);

  const { toast } = useToast();

  function closeModal() {
    setCurrentPhoto(null);
    setCurrentPhotoId(null);
    setOpen(false);
  }

  function openModal(photo: Photo, index: number) {
    setOpen(true);
    setCurrentPhotoId(index);
    setCurrentPhoto(photo);
  }

  function prevPhoto() {
    if (currentPhotoId) {
      setCurrentPhoto(props.photos[currentPhotoId - 1]);
      setCurrentPhotoId(currentPhotoId - 1);
    }
  }
  function nextPhoto() {
    setCurrentPhoto(props.photos[(currentPhotoId ? currentPhotoId : 0) + 1]);
    setCurrentPhotoId((currentPhotoId ? currentPhotoId : 0) + 1);
  }

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => nextPhoto(),
    onSwipedRight: () => prevPhoto(),
  });

  useKeypress(["ArrowLeft", "ArrowRight", "Escape"], (e: KeyboardEvent) => {
    if (e.key == "Escape") {
      closeModal();
    } else if (
      e.key == "ArrowRight" &&
      currentPhotoId != props.photos.length - 1
    ) {
      nextPhoto();
    } else if (e.key == "ArrowLeft" && currentPhotoId != 0) {
      prevPhoto();
    }
  });

  async function deletePhoto(
    e: React.MouseEvent<HTMLButtonElement>,
    photo: Photo
  ) {
    e.preventDefault();
    setLoading(true);
    console.log(photo);
    try {
      const apiUrlEndpoint = "http://localhost:3000/api/admin/deletephoto";
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
          setPhotos((prev) =>
            prev.filter((prevphoto) => prevphoto.id !== photo.id)
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
    <>
      <ul className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-flow-row-dense">
        {photos?.map((photo, index) => {
          return (
            <li
              key={index}
              className={`relative group rounded-md cursor-pointer overflow-hidden ${
                photo.width < photo.height
                  ? "row-span-2"
                  : index % 7
                  ? ""
                  : "row-span-2 col-span-2"
              }`}
            >
              <AlertDialog onOpenChange={setModalOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="absolute hidden top-4 right-4 p-2 pl-[7px] rounded-lg group-hover:flex bg-red-600 hover:bg-red-500">
                    <Plus className="rotate-45" />
                    <span className="text-lg sr-only">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Êtes-vous sûr de vouloir supprimer cette photo ?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette suppression est irréversible. Cette photo sera
                      supprimée de manière permanente de cet événement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-500"
                      onClick={(e) => deletePhoto(e, photo)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2
                            color="#ffffff"
                            className="h-4 w-4 animate-spin mr-2 text-white"
                          />
                          En cours
                        </>
                      ) : (
                        "Continue"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Image
                className="w-full h-full object-cover"
                src={photo.url}
                width={photo.width}
                height={photo.height}
                alt={props.eventName}
                quality={30}
                onClick={() => openModal(photo, index)}
              />
            </li>
          );
        })}
      </ul>
      {isOpen ? (
        <section
          {...swipeHandlers}
          className="fixed inset-0 bg-black text-white py-8"
        >
          <div className="flex items-center justify-between mb-4 max-w-[calc(100%_-_4rem)] mx-auto">
            {currentPhoto?.name}
            <div>
              {currentPhoto ? (
                <Button asChild>
                  <a href={currentPhoto.url} download>
                    <Download className="mr-2" />
                    Download
                  </a>
                </Button>
              ) : (
                ""
              )}

              <Button className="ml-2" onClick={() => closeModal()}>
                <XCircle className="mr-2" />
                Close
              </Button>
            </div>
          </div>
          {currentPhoto ? (
            <Image
              className="w-[calc(100%_-_8rem)] mx-auto h-[calc(100%_-_4rem)] object-contain"
              src={currentPhoto.url}
              width={currentPhoto.width}
              height={currentPhoto.height}
              alt={currentPhoto.name}
              quality={30}
              priority
            />
          ) : (
            ""
          )}

          <Button
            className="absolute left-8 top-1/2 rounded-full p-2 w-16 h-16"
            disabled={currentPhotoId ? false : true}
            onClick={() => prevPhoto()}
          >
            <ChevronLeftCircle className="w-16 h-16" />{" "}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute right-8 top-1/2 rounded-full p-2 w-16 h-16"
            disabled={currentPhotoId == props.photos.length - 1}
            onClick={() => nextPhoto()}
          >
            <ChevronRightCircle className="w-16 h-16" />
            <span className="sr-only">Suivant</span>
          </Button>
        </section>
      ) : (
        <></>
      )}
    </>
  );
}
