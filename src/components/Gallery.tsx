"use client";
import { Photo } from "@prisma/client";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import {
  ChevronLeftCircle,
  ChevronRightCircle,
  Download,
  XCircle,
} from "lucide-react";
import useSwipe from "../hooks/useSwipe";
import useKeypress from "react-use-keypress";

export default function Gallery(props: { eventName: string; photos: Photo[] }) {
  const [isOpen, setOpen] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [currentPhotoId, setCurrentPhotoId] = useState<number | null>(null);

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

  return (
    <>
      <ul className="mt-4 grid grid-flow-row-dense grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {props.photos.map((photo, index) => {
          return (
            <Image
              key={index}
              className={`h-full w-full cursor-pointer rounded-md object-cover
                ${
                  photo.width < photo.height
                    ? "row-span-2"
                    : index % 7
                    ? ""
                    : "row-span-2 md:col-span-2"
                }`}
              src={photo.url}
              width={photo.width}
              height={photo.height}
              alt={props.eventName}
              quality={10}
              onClick={() => openModal(photo, index)}
            />
          );
        })}
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

              <Button className="ml-2" onClick={() => closeModal()}>
                <XCircle className="mr-2" />
                Close
              </Button>
            </div>
          </div>
          {currentPhoto ? (
            <Image
              className="mx-auto h-[calc(100%_-_4rem)] w-[calc(100%_-_2rem)] object-contain sm:w-[calc(100%_-_8rem)]"
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
            className="absolute bottom-4 left-8 h-16 w-16 rounded-full p-2 sm:top-1/2"
            disabled={currentPhotoId ? false : true}
            onClick={() => prevPhoto()}
          >
            <ChevronLeftCircle className="h-16 w-16" />{" "}
            <span className="sr-only">Précédent</span>
          </Button>
          <Button
            className="absolute bottom-4 right-8 h-16 w-16 rounded-full p-2 sm:top-1/2"
            disabled={currentPhotoId == props.photos.length - 1}
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
