"use client";

import { SponsorLogoInput } from "@/components/SponsorLogoInput";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useToast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const MAX_FILE_SIZE = 10000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  url: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  logo: z
    .custom<FileList>((v) => v instanceof FileList)
    .refine((files) => files.length == 1, "Image is required.")
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files[0]?.type),
      ".jpg, .jpeg, .png and .webp files are accepted.",
    )
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      `Max file size is 10MB.`,
    ),
});

export default function NewSponsorPage() {
  const [isLoading, setLoading] = useState<boolean>(false);

  const [image, setImage] = useState<string | null>();

  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });
  const {
    formState: { errors },
    register,
    reset,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(values.logo.length);
    console.log(values.logo?.[0].size);

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const formData = new FormData();
    formData.append("logo", values.logo[0]);

    const { logo, ...data } = values;

    formData.append("values", JSON.stringify(data));
    console.log(formData);

    try {
      const apiUrlEndpoint = `/api/admin/newsponsor`;
      const postData = {
        method: "POST",
        body: formData,
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      setLoading(false);
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
          title: "Enregistrement du sponsor réussi",
          description:
            "Vous pouvez maintenant l'ajouter comme sponsor d'un événement",
        });
        setImage(null);
        reset();
        // router.push("/connexion");
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  }
  return (
    <section>
      <h2>New Sponsor Page</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-lg space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Nom du sponsor</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    required
                    placeholder="Nouveau sponsor"
                    {...field}
                  />
                </FormControl>
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="url"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Lien vers le site du sponsor</FormLabel>
                <FormControl>
                  <Input type="text" required placeholder="URL" {...field} />
                </FormControl>
                {/* <FormDescription>
                This is your public display name.
              </FormDescription> */}
                <FormMessage />
              </FormItem>
            )}
          />

          {image && (
            <img src={image} alt="logo" className="mt-1 w-full rounded-xl" />
          )}
          <SponsorLogoInput
            errors={errors}
            register={register}
            setImage={setImage}
          />
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
            className="ml-4"
            onClick={() => {
              reset(), setImage(null);
            }}
          >
            Reset
          </Button>
        </form>
      </Form>
    </section>
  );
}
