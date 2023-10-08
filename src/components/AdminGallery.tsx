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
import { Form } from "./ui/form";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddPhotosInput } from "./AddPhotosInput";
import AdminGalleryPhoto from "./AdminGalleryPhoto";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 10000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

function handleFiles(files: FileList, key: string) {
  switch (key) {
    case "type":
      for (let index = 0; index < files.length; index++) {
        if (!ACCEPTED_IMAGE_TYPES.includes(files[index].type)) {
          return false;
        }
      }
      return true;
    case "size":
      for (let index = 0; index < files.length; index++) {
        if (files[index].size > MAX_FILE_SIZE) {
          return false;
        }
      }
      return true;
    default:
      break;
  }
}

const formSchema = z.object({
  photos: z
    .custom<FileList>((v) => v instanceof FileList)
    .refine((files) => files.length >= 1, "Images is required.")
    .refine(
      (files) => handleFiles(files, "type"),
      ".jpg, .jpeg, .png and .webp files are accepted."
    )
    .refine((files) => handleFiles(files, "size"), `Max file size is 10MB.`),
});

export default function AdminGallery(props: {
  eventId: string;
  eventName: string;
  photos: Photo[];
}) {
  const [photos, setPhotos] = useState<Photo[]>(props.photos);

  const [isLoading, setLoading] = useState<boolean>(false);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const [isOpen, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);

  const [isDeleteEventModalOpen, setDeleteEventModalOpen] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  function closeLightbox() {
    setCurrentPhoto(null);
    setCurrentPhotoId(null);
    setOpen(false);
  }

  function openLightbox(photo: Photo, index: number) {
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
    onSwipedLeft: () => {
      if (currentPhotoId != props.photos.length - 1) {
        nextPhoto();
      }
    },
    onSwipedRight: () => {
      if (currentPhotoId != 0) {
        prevPhoto();
      }
    },
  });

  useKeypress(["ArrowLeft", "ArrowRight", "Escape"], (e: KeyboardEvent) => {
    if (e.key == "Escape") {
      closeLightbox();
    } else if (
      e.key == "ArrowRight" &&
      currentPhotoId != props.photos.length - 1
    ) {
      nextPhoto();
    } else if (e.key == "ArrowLeft" && currentPhotoId != 0) {
      prevPhoto();
    }
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const {
    formState: { errors },
    register,
    reset,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const formData = new FormData();
    for (let index = 0; index < values.photos.length; index++) {
      // formData.append(`file-${index}`, values.photos[index]);
      formData.append("file", values.photos[index]);
    }

    formData.append("id", JSON.stringify(props.eventId));
    console.log(formData);

    try {
      const apiUrlEndpoint = `/api/admin/addphotos`;
      const postData = {
        method: "POST",
        body: formData,
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
        toast({
          variant: "default",
          title: "Photo(s) successfully added !",
        });
        const res = await response.json();
        console.log(res);
        if (res.event.photos) {
          setPhotos(res.event.photos);
        }
        reset();
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  async function deleteEvent(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setDeleteLoading(true);
    try {
      const response = await fetch("/api/admin/deleteevent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(props.eventId),
      });
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
          title: "Suppression de l'événement réussie",
          description: `${name} a été supprimé !`,
        });
        router.push("/admin/events-management");
      }
    } catch (error) {
      console.log(error);
    }

    setDeleteEventModalOpen(false);
    setDeleteLoading(false);
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 max-w-lg"
        >
          <AddPhotosInput errors={errors} register={register} />
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="h-4 w-4 animate-spin mr-2 text-white"
                />
                Loading
              </>
            ) : (
              "Add"
            )}
          </Button>
          <Button
            variant="outline"
            type="reset"
            className="ml-4"
            onClick={() => {
              reset();
            }}
          >
            Reset
          </Button>
        </form>
      </Form>
      <AlertDialog
        onOpenChange={setDeleteEventModalOpen}
        open={isDeleteEventModalOpen}
      >
        <AlertDialogTrigger asChild>
          <Button className="bg-red-600 hover:bg-red-500 mt-6 w-full">
            Supprimer l&apos;événement
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Êtes-vous sûr de vouloir supprimer cet événement ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette suppression est irréversible. Cet événement et
              l&apos;entièreté des photos associés à celui-ci seront supprimés
              de manière permanente !
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500"
              onClick={(e) => deleteEvent(e)}
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2
                    color="#ffffff"
                    className="h-4 w-4 animate-spin mr-2 text-white"
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
      <ul className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-flow-row-dense">
        {photos?.map((photo, index) => (
          <AdminGalleryPhoto
            key={index}
            photo={photo}
            index={index}
            photos={photos}
            setPhotos={setPhotos}
            openLightbox={openLightbox}
            eventName={props.eventName}
          />
        ))}
      </ul>

      {isOpen ? (
        <section
          {...swipeHandlers}
          className="fixed inset-0 bg-black text-white py-8"
        >
          <div className="flex items-center justify-between mb-4 max-w-[calc(100%_-_4rem)] mx-auto flex-col sm:flex-row gap-2">
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

              <Button className="ml-2" onClick={() => closeLightbox()}>
                <XCircle className="mr-2" />
                Close
              </Button>
            </div>
          </div>
          {currentPhoto ? (
            <Image
              className="w-[calc(100%_-_2rem)] sm:w-[calc(100%_-_8rem)] mx-auto h-[calc(100%_-_4rem)] object-contain"
              src={currentPhoto.url}
              width={currentPhoto.width}
              height={currentPhoto.height}
              alt={currentPhoto.name}
              quality={10}
              priority
            />
          ) : (
            ""
          )}

          <Button
            className="absolute left-8 bottom-4 sm:top-1/2 rounded-full p-2 w-16 h-16"
            disabled={currentPhotoId ? false : true}
            onClick={() => prevPhoto()}
          >
            <ChevronLeftCircle className="w-16 h-16" />{" "}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute right-8 bottom-4 sm:top-1/2 rounded-full p-2 w-16 h-16"
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
