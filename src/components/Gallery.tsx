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
      <ul className="mt-4 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 grid-flow-row-dense">
        {props.photos.map((photo, index) => {
          return (
            <Image
              key={index}
              className={`w-full h-full object-cover rounded-md cursor-pointer
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
          className="fixed inset-0 bg-black text-white py-8 z-20"
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

              <Button className="ml-2" onClick={() => closeModal()}>
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
