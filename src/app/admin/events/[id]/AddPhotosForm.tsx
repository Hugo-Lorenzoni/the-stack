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
import { Photo, Type } from "@prisma/client";
import { getResponseMessage } from "@/lib/http";

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
  onPhotosAdded,
}: {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventType: Type;
  onPhotosAdded: (photos: Photo[]) => void;
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
          if (res.photo) {
            setProgress((value) => value + (1 / values.photos.length) * 100);
            toast(`Photo ajoutée : ${res.photo.name}`);
          }
          return {
            status: "success" as const,
            index,
            photo: res.photo as Photo,
          };
        } else if (response.status == 409) {
          toast.warning(`Photo déjà existante : ${values.photos[index].name}`, {
            description: await getResponseMessage(
              response,
              "Un événement avec ce nom et cette date existe déjà, ou le dossier cible est déjà présent.",
            ),
            duration: 10000,
          });
          return { status: "duplicate" as const, index };
        } else if (response.status == 504) {
          toast.warning("Délai dépassé", {
            description:
              "L'upload a pris trop de temps - La photo ne s'est peut-être pas uploadée correctement",
            duration: 20000,
          });
          return { status: "failed" as const, index };
        } else {
          toast.error("Erreur lors de l'upload", {
            description: "Une erreur est survenue pendant l'envoi de la photo.",
            duration: 10000,
          });
          return { status: "failed" as const, index };
        }
      } catch (error) {
        console.log(error);
        return { status: "failed" as const, index };
      }
    });

    let successCount = 0;
    let failedCount = 0;
    const newPhotos: Photo[] = [];
    const successNames: string[] = [];
    for (let i = 0; i < values.photos.length; i++) {
      const result = await files[i];
      if (result?.status === "success") {
        successCount++;
        if (result.photo) {
          newPhotos.push(result.photo);
          successNames.push(result.photo.name);
        }
      } else {
        failedCount++;
      }
    }
    if (newPhotos.length > 0) {
      onPhotosAdded(newPhotos);
      reset();
    }
    if (failedCount > 0) {
      const successList =
        successNames.length > 0
          ? `Photos ajoutées : ${successNames.join(", ")}.`
          : "Aucune photo n'a été ajoutée.";
      toast.error("Certaines photos n'ont pas été ajoutées", {
        description: `${failedCount} échec(s). ${successList} Consultez les notifications précédentes pour plus d'informations.`,
        duration: 10000,
      });
    } else if (successCount > 0) {
      toast.success(`${successCount} photos ajoutées avec succès !`);
    }
    setLoading(false);
    setProgress(0);
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
            Réinitialiser
          </Button>
        </div>
      </form>
    </Form>
  );
});

export default AddPhotosForm;
