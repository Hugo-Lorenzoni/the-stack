"use client";
import { Button } from "@/components//ui/button";
import { useCallback, useEffect, useState } from "react";

import { Photo, Type } from "@prisma/client";

import { ChevronLeft, ChevronRight, Download, XCircle } from "lucide-react";

import useSwipe from "@/hooks/useSwipe";

import DeletePhotoButton from "./DeletePhotoButton";
import DeleteEventButton from "./DeleteEventButton";
import EditEventModal from "./EditEventModal";
import ImageComponent from "@/components/ImageComponent";
import ChangeCoverModal from "./ChangeCoverModal";
import DownloadAllPicturesButton from "./DownloadAllPicturesButton";
import AddPhotosForm from "./AddPhotosForm";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventPinned: boolean;
  eventType: Type;
  eventPassword: string | undefined;
  eventPhotos: Photo[];
  eventNotes: string | undefined;
  eventCoverName: string;
  eventCoverUrl: string;
  eventCoverWidth: number;
  eventCoverHeight: number;
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
  eventCoverName,
  eventCoverUrl,
  eventCoverWidth,
  eventCoverHeight,
}: Props) {
  const [photos, setPhotos] = useState<Photo[]>(eventPhotos);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const photoId = parseInt(searchParams.get("photoId") || "");
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(photoId);

  useEffect(() => {
    setCurrentPhotoId(photoId);
  }, [photoId]);

  useEffect(() => {
    if (
      currentPhotoId !== null &&
      !isNaN(currentPhotoId) &&
      currentPhotoId < photos.length &&
      photoId !== null &&
      !isNaN(photoId) &&
      photoId < photos.length &&
      currentPhotoId !== photoId
    ) {
      router.replace(`${pathname}?photoId=${currentPhotoId}`, {
        scroll: false,
      });
    }
  }, [currentPhotoId, pathname, router, photoId]);

  const closeLightbox = useCallback(() => {
    setCurrentPhotoId(null);
    router.push(pathname, { scroll: false });
  }, [router]);

  function openLightbox(index: number) {
    setCurrentPhotoId(index);
    router.push(`${pathname}?photoId=${index}`, { scroll: false });
  }

  const prevPhoto = () => {
    setCurrentPhotoId((id) => (id !== null ? id - 1 : null));
  };

  const nextPhoto = () => {
    setCurrentPhotoId((id) => (id !== null ? id + 1 : null));
  };

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (photoId != eventPhotos.length - 1) {
        nextPhoto();
      }
    },
    onSwipedRight: () => {
      if (photoId != 0) {
        prevPhoto();
      }
    },
  });

  const totalPhotos = eventPhotos.length;

  useEffect(() => {
    function handleKeyPress(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight" && photoId !== totalPhotos - 1) {
        nextPhoto();
      } else if (e.key === "ArrowLeft" && photoId !== 0) {
        prevPhoto();
      }
    }

    // Add event listener
    document.addEventListener("keydown", handleKeyPress);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [closeLightbox, nextPhoto, prevPhoto, photoId, totalPhotos]);

  return (
    <>
      <AddPhotosForm
        eventId={eventId}
        eventTitle={eventTitle}
        eventDate={eventDate}
        eventType={eventType}
      />
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <EditEventModal
          eventId={eventId}
          eventTitle={eventTitle}
          eventDate={eventDate}
          eventPinned={eventPinned}
          eventType={eventType}
          eventPassword={eventPassword}
          eventNotes={eventNotes}
        />
        <ChangeCoverModal
          eventId={eventId}
          eventCoverName={eventCoverName}
          eventCoverUrl={eventCoverUrl}
          eventCoverWidth={eventCoverWidth}
          eventCoverHeight={eventCoverHeight}
        />
        <DownloadAllPicturesButton eventId={eventId} />
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
            key={photo.id}
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
              onClick={() => openLightbox(index)}
            />
          </li>
        ))}
      </ul>

      {photoId !== null && !isNaN(photoId) && photoId <= eventPhotos.length ? (
        <section
          {...swipeHandlers}
          className="fixed inset-0 z-20 bg-black py-8 text-white"
        >
          <div className="mx-auto mb-4 flex max-w-[calc(100%-4rem)] flex-col items-center justify-between gap-2 sm:flex-row">
            {photos[photoId]?.name}
            <div>
              {photos[photoId] ? (
                <Button asChild>
                  <a href={photos[photoId].url} download>
                    <Download />
                    Download
                  </a>
                </Button>
              ) : (
                ""
              )}

              <Button className="ml-2" onClick={() => closeLightbox()}>
                <XCircle />
                Close
              </Button>
            </div>
          </div>
          {photos[photoId] ? (
            <ImageComponent
              className="mx-auto h-[calc(100%-4rem)] w-[calc(100%-2rem)] object-contain sm:w-[calc(100%-8rem)]"
              src={photos[photoId].url}
              width={photos[photoId].width}
              height={photos[photoId].height}
              alt={photos[photoId].name}
              quality="preview"
            />
          ) : (
            ""
          )}

          <Button
            className="absolute bottom-4 left-8 size-16 rounded-full p-2 sm:top-1/2"
            disabled={photoId ? false : true}
            onClick={() => prevPhoto()}
          >
            <ChevronLeft className="size-10" />{" "}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute right-8 bottom-4 size-16 rounded-full p-2 sm:top-1/2"
            disabled={photoId == eventPhotos.length - 1}
            onClick={() => nextPhoto()}
          >
            <ChevronRight className="size-10" />
            <span className="sr-only">Suivant</span>
          </Button>
        </section>
      ) : (
        <></>
      )}
    </>
  );
}
