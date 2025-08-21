import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import AddPhotosInput from "./AddPhotosInput";
import { Loader2 } from "lucide-react";
import { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Type } from "@prisma/client";

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
    .refine(
      (files) => files.length >= 1,
      "Au moins une photo doit être sélectionnée pour l'événement. Ajoutez une ou plusieurs images afin de continuer.",
    )
    .refine(
      (files) => handleFiles(files, "type"),
      "Seuls les fichiers aux formats .jpg, .jpeg, .png et .webp sont acceptés pour les photos. Retirez les fichiers non pris en charge et réessayez.",
    )
    .refine(
      (files) => handleFiles(files, "size"),
      "La taille maximale autorisée pour chaque photo est de 10 Mo. Supprimez les fichiers trop volumineux ou réduisez leur taille avant l'envoi.",
    ),
});

const AddPhotosForm = memo(function AddPhotosForm({
  eventId,
  eventTitle,
  eventDate,
  eventType,
}: {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventType: Type;
}) {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState(0);

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

      // formData.append(`file-${index}`, values.photos[index]);
      photoData.append("file", photo);
      photoData.append(
        "values",
        JSON.stringify({
          id: eventId,
          title: eventTitle,
          date: eventDate,
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
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-lg space-y-2"
      >
        <AddPhotosInput errors={errors} register={register} />
        {isLoading ? <Progress value={progress} /> : ""}
        <div className="flex items-center gap-2">
          <Button disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Loader2
                  color="#ffffff"
                  className="size-4 animate-spin text-white"
                />
                Ajout des photos en cours
              </>
            ) : (
              "Ajouter"
            )}
          </Button>
          <Button
            variant="outline"
            type="reset"
            onClick={() => {
              reset();
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default AddPhotosForm;
