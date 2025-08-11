"use client";
import { Button } from "@/components//ui/button";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { toast } from "sonner";

import { Photo, Type } from "@prisma/client";

import Image from "next/image";

import {
  ChevronLeftCircle,
  ChevronRightCircle,
  Download,
  Loader2,
  XCircle,
} from "lucide-react";

import useSwipe from "@/hooks/useSwipe";
import useKeypress from "react-use-keypress";

import AddPhotosInput from "./AddPhotosInput";
import DeletePhotoButton from "./DeletePhotoButton";
import DeleteEventButton from "./DeleteEventButton";
import EditEventModal from "./EditEventModal";
import ImageComponent from "@/components/ImageComponent";

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
      ".jpg, .jpeg, .png and .webp files are accepted.",
    )
    .refine((files) => handleFiles(files, "size"), `Max file size is 10MB.`),
});

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventPinned: boolean;
  eventType: Type;
  eventPassword: string | undefined;
  eventPhotos: Photo[];
  eventNotes: string | undefined;
};

export default function AdminGallery({
  eventId,
  eventTitle,
  eventDate,
  eventPinned,
  eventType,
  eventPassword,
  eventPhotos,
  eventNotes,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(eventPhotos);

  const [isLoading, setLoading] = useState<boolean>(false);

  const [isOpen, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);

  const [progress, setProgress] = useState(0);

  const eventDateString = eventDate.toISOString().substring(0, 10);

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
      setCurrentPhoto(eventPhotos[currentPhotoId - 1]);
      setCurrentPhotoId(currentPhotoId - 1);
    }
  }
  function nextPhoto() {
    setCurrentPhoto(eventPhotos[(currentPhotoId ? currentPhotoId : 0) + 1]);
    setCurrentPhotoId((currentPhotoId ? currentPhotoId : 0) + 1);
  }

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (currentPhotoId != eventPhotos.length - 1) {
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
      currentPhotoId != eventPhotos.length - 1
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

    const files = Array.from(values.photos).map(async (photo, index) => {
      const photoData = new FormData();
      console.log(eventDate);
      console.log(eventDateString);

      // formData.append(`file-${index}`, values.photos[index]);
      photoData.append("file", photo);
      photoData.append(
        "values",
        JSON.stringify({
          id: eventId,
          title: eventTitle,
          date: eventDateString,
          type: eventType,
        }),
      );
      // console.log(photoData);

      try {
        const apiUrlEndpoint = "/api/admin/event/photo";
        const postData = {
          method: "POST",
          body: photoData,
        };
        const response = await fetch(apiUrlEndpoint, postData);
        // console.log(response);
        if (response.status == 200) {
          const res = await response.json();
          // console.log(res);
          if (res.photo && res.event.photos) {
            setProgress((value) => value + (1 / values.photos.length) * 100);
            toast(`${res.photo.name} successfully added !`);
            // setPhotos(res.event.photos);
          }
          return index;
        } else if (response.status == 504) {
          toast.warning(
            `${response.status.toString()} - ${response.statusText}`,
            {
              description:
                "L'upload a pris trop de temps - La photo ne s'est peut-être pas uploadée correctement",
              duration: 20000,
            },
          );
        } else {
          toast.error(response.status.toString(), {
            description: response.statusText,
          });
        }
      } catch (error) {
        console.log(error);
      }
    });

    let index = 0;
    for (let i = 0; i < values.photos.length; i++) {
      const file = await files[i];
      if (typeof file === "number") {
        index++;
      }
    }
    if (index == values.photos.length) {
      toast.success(`${index} photos were successfully added !`);
      reset();
    } else {
      toast.error(
        `${values.photos.length - index} photos failed to be uploaded`,
      );
    }
    setLoading(false);
    setProgress(0);
    window.location.reload();
  }

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-lg space-y-2"
        >
          <AddPhotosInput errors={errors} register={register} />
          {isLoading ? <Progress value={progress} /> : ""}
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="mr-2 h-4 w-4 animate-spin text-white"
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
      <div className="mt-4 flex justify-end gap-2">
        <EditEventModal
          {...{
            eventId,
            eventTitle,
            eventDate,
            eventPinned,
            eventType,
            eventPassword,
            eventNotes,
          }}
        />
        <DeleteEventButton eventId={eventId} />
      </div>
      <ul className="mt-4 grid grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {photos?.map((photo, index) => (
          <li
            className={`group relative cursor-pointer overflow-hidden rounded-md ${
              photo.width < photo.height
                ? "row-span-2"
                : index % 7
                ? ""
                : "row-span-2 md:col-span-2"
            }`}
            key={index}
          >
            <DeletePhotoButton
              photo={photo}
              photos={photos}
              setPhotos={setPhotos}
            />
            <ImageComponent
              className="h-full w-full object-cover"
              src={photo.url}
              width={photo.width}
              height={photo.height}
              alt={eventTitle}
              quality="thumbnail"
              onClick={() => openLightbox(photo, index)}
            />
          </li>
        ))}
      </ul>

      {isOpen ? (
        <section
          {...swipeHandlers}
          className="fixed inset-0 z-20 bg-black py-8 text-white"
        >
          <div className="mx-auto mb-4 flex max-w-[calc(100%_-_4rem)] flex-col items-center justify-between gap-2 sm:flex-row">
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
            <ImageComponent
              className="mx-auto h-[calc(100%_-_4rem)] w-[calc(100%_-_2rem)] object-contain sm:w-[calc(100%_-_8rem)]"
              src={currentPhoto.url}
              width={currentPhoto.width}
              height={currentPhoto.height}
              alt={currentPhoto.name}
              quality="preview"
            />
          ) : (
            ""
          )}

          <Button
            className="absolute bottom-4 left-8 h-16 w-16 rounded-full p-2 sm:top-1/2"
            disabled={currentPhotoId ? false : true}
            onClick={() => prevPhoto()}
          >
            <ChevronLeftCircle className="h-16 w-16" />{" "}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute bottom-4 right-8 h-16 w-16 rounded-full p-2 sm:top-1/2"
            disabled={currentPhotoId == eventPhotos.length - 1}
            onClick={() => nextPhoto()}
          >
            <ChevronRightCircle className="h-16 w-16" />
            <span className="sr-only">Suivant</span>
          </Button>
        </section>
      ) : (
        <></>
      )}
    </>
  );
}
