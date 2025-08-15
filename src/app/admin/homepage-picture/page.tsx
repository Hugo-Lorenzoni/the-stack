"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import ImageComponent from "@/components/ImageComponent";
import { Loader2 } from "lucide-react";
import { NewHomepagePictureInput } from "./NewHomepagePictureInput";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  picture: z
    .custom<FileList>((v) => v instanceof FileList)
    .refine((files) => files.length == 1, "Image is required.")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    ),
});

export type Video = z.infer<typeof formSchema>;

export default function NewVideoPage() {
  const [isLoading, setLoading] = useState(false);
  const [newHomepagePicture, setNewHomepagePicture] = useState<string | null>(
    null,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });
  const {
    formState: { errors },
    reset,
    register,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    console.log(values);
    const formData = new FormData();
    formData.append("picture", values.picture[0]);

    try {
      const apiUrlEndpoint = "/api/admin/changehomepage";
      const postData = {
        method: "POST",
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        toast.success(
          "Changement de la photo de la page d'accueil effectué avec succès !",
          {
            description:
              "Vous pouvez maintenant la retrouver sur la page d'accueil.",
          },
        );
        reset();
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }
  return (
    <section>
      <h2>Changer la photo de la page d&apos;accueil</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="mt-4 flex max-w-xl flex-1 flex-col gap-4"
        >
          <div className="space-y-2 text-sm">
            <div>Photo de couverture actuelle</div>
            <ImageComponent
              src="/homepage.jpg"
              alt="current cover"
              className="mt-1 w-full rounded-xl"
              width={4000}
              height={2667}
              quality="preview"
            />
          </div>
          {newHomepagePicture && (
            <div className="space-y-2 text-sm">
              <div>Nouvelle photo de couverture</div>
              <img
                src={newHomepagePicture}
                alt="cover"
                className="mt-1 w-full rounded-xl"
              />
            </div>
          )}
          <NewHomepagePictureInput
            errors={errors}
            register={register}
            setImage={setNewHomepagePicture}
          />
          <div className="flex flex-col gap-2">
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
                "Submit"
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
    </section>
  );
}
