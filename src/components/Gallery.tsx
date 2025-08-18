"use client";
import { Photo } from "@prisma/client";
import { ChevronLeft, ChevronRight, Download, XCircle } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import useSwipe from "../hooks/useSwipe";
import ImageComponent from "./ImageComponent";
import { Button } from "./ui/button";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function Gallery({
  eventName,
  photos,
}: {
  eventName: string;
  photos: Photo[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const photoId = parseInt(searchParams.get("photoId") || "");
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(photoId);

  useEffect(() => {
    setCurrentPhotoId(photoId);
  }, [photoId]);

  const totalPhotos = photos.length;

  useEffect(() => {
    if (
      currentPhotoId !== null &&
      !isNaN(currentPhotoId) &&
      currentPhotoId < totalPhotos &&
      photoId !== null &&
      !isNaN(photoId) &&
      photoId < totalPhotos &&
      currentPhotoId !== photoId
    ) {
      router.replace(`${pathname}?photoId=${currentPhotoId}`, {
        scroll: false,
      });
    }
  }, [currentPhotoId, pathname, router, photoId, totalPhotos]);

  const closeLightbox = useCallback(() => {
    setCurrentPhotoId(null);
    router.push(pathname, { scroll: false });
  }, [router]);

  function openLightbox(index: number) {
    setCurrentPhotoId(index);
    router.push(`${pathname}?photoId=${index}`, { scroll: false });
  }

  const prevPhoto = useCallback(() => {
    setCurrentPhotoId((id) => (id !== null ? id - 1 : null));
  }, []);

  const nextPhoto = useCallback(() => {
    setCurrentPhotoId((id) => (id !== null ? id + 1 : null));
  }, []);

  const swipeHandlers = useSwipe({
    onSwipedLeft: () => {
      if (photoId != photos.length - 1) {
        nextPhoto();
      }
    },
    onSwipedRight: () => {
      if (photoId != 0) {
        prevPhoto();
      }
    },
  });

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
      <ul className="mt-4 grid grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {photos.map((photo, index) => {
          return (
            <ImageComponent
              key={index}
              index={index}
              className={`h-full w-full cursor-pointer rounded-md object-cover ${
                photo.width < photo.height
                  ? "row-span-2"
                  : index % 7
                    ? ""
                    : "row-span-2 md:col-span-2"
              }`}
              src={photo.url}
              width={photo.width}
              height={photo.height}
              alt={eventName}
              onClick={() => openLightbox(index)}
              quality="thumbnail"
            />
          );
        })}
      </ul>
      {currentPhotoId !== null &&
      !isNaN(currentPhotoId) &&
      currentPhotoId <= photos.length ? (
        <section
          {...swipeHandlers}
          className="fixed inset-0 z-20 bg-black py-8 text-white"
        >
          <div className="mx-auto mb-4 flex max-w-[calc(100%-4rem)] flex-col items-center justify-between gap-2 sm:flex-row">
            {photos[currentPhotoId]?.name}
            <div>
              {photos[currentPhotoId] ? (
                <Button asChild>
                  <a href={photos[currentPhotoId].url} download>
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
          {photos[currentPhotoId] ? (
            <ImageComponent
              className="mx-auto h-[calc(100%-4rem)] w-[calc(100%-2rem)] object-contain sm:w-[calc(100%-8rem)]"
              src={photos[currentPhotoId].url}
              width={photos[currentPhotoId].width}
              height={photos[currentPhotoId].height}
              alt={photos[currentPhotoId].name}
              quality="preview"
            />
          ) : (
            ""
          )}

          <Button
            className="absolute bottom-4 left-8 size-16 rounded-full sm:top-1/2"
            disabled={currentPhotoId ? false : true}
            onClick={() => prevPhoto()}
          >
            {/* <div className="flex size-12 items-center justify-center"> */}
            <ChevronLeft className="size-10" />
            {/* </div> */}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute right-8 bottom-4 size-16 rounded-full sm:top-1/2"
            disabled={currentPhotoId == photos.length - 1}
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
