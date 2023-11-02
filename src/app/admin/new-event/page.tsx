"use client";

import { CoverInput } from "@/app/admin/new-event/CoverInput";
import { PhotosInput } from "@/app/admin/new-event/PhotosInput";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { Type } from "@prisma/client";

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

import { Noop, RefCallBack, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { CalendarIcon, Loader2 } from "lucide-react";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

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

const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Must be 2 or more characters long" })
      .max(50, { message: "Must be 50 or fewer characters long" })
      .trim(),
    date: z.date(),
    notes: z
      .string()
      .min(2, { message: "Must be 2 or more characters long" })
      .max(750, { message: "Must be 750 or fewer characters long" })
      .trim()
      .optional(),
    pinned: z.boolean(),
    // pinned: z.boolean().optional(),
    cover: z
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

    type: z.enum(TypeList),
    password: z.string().optional(),
    photos: z
      .custom<FileList>((v) => v instanceof FileList)
      .refine((files) => files.length >= 1, "Images is required.")
      .refine(
        (files) => handleFiles(files, "type"),
        ".jpg, .jpeg, .png and .webp files are accepted.",
      )
      .refine((files) => handleFiles(files, "size"), `Max file size is 10MB.`),
  })
  .refine((data) => data.type != "AUTRE" || data.password, {
    message: "Un mot de passe est requis pour les événement de type AUTRE",
    path: ["password"], // path of error
  });

export default function NewEventPage() {
  const [type, setType] = useState<Type>("OUVERT");

  const [isLoading, setLoading] = useState<boolean>(false);

  const [image, setImage] = useState<string | null>();

  const [progress, setProgress] = useState(0);

  function handleChange(field: {
    onChange: any;
    onBlur?: Noop;
    value: any;
    name?: "type";
    ref?: RefCallBack;
  }) {
    if (field.onChange) {
      if (field.value != undefined) {
        setType(field?.value);
      }
    }
    return field.onChange;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      pinned: false,
      type: "BAPTISE",
    },
  });

  const {
    formState: { errors },
    register,
    reset,
    resetField,
    setError,
  } = form;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const { cover, photos, ...data } = values;

    const eventData = new FormData();

    eventData.append("cover", cover[0]);
    eventData.append("values", JSON.stringify(data));
    // console.log(eventData);

    try {
      const apiUrlEndpoint = "/api/admin/event";
      const postData = {
        method: "POST",
        body: eventData,
      };
      const response = await fetch(apiUrlEndpoint, postData);
      // console.log(response);
      if (response.status == 200) {
        setProgress(10);
        toast.success("Enregistrement de l'événement réussi", {
          description: "En attente de l'upload des photos",
        });
        const res = await response.json();

        const files = Array.from(values.photos).map(async (photo, index) => {
          const photoData = new FormData();

          // formData.append(`file-${index}`, values.photos[index]);
          photoData.append("file", photo);

          photoData.append("values", JSON.stringify(res.event));
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
              setProgress((value) => value + (1 / values.photos.length) * 90);
              toast(`${res.photo.name} successfully added !`);
              return index;
            } else if (response.status == 504) {
              toast.warning(
                `${response.status.toString()} - ${response.statusText}`,
                {
                  description:
                    "L'upload a pris trop de temps - La photo ne s'est peut-être pas uploadée correctement",
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
        for (let i = 0; i < files.length; i++) {
          const file = await files[i];
          if (typeof file === "number") {
            index++;
          }
        }
        if (index == values.photos.length) {
          toast.success(`${index} photos were successfully added !`);
          setImage(null);
          reset();
          toast.success("Enregistrement de l'événement et des photos réussi", {
            description: "N'oubliez pas de le publier !",
          });
        } else {
          toast.error(
            `${values.photos.length - index} photos failed to be uploaded`,
          );
        }
      } else {
        if (response.status == 415) {
          toast.warning(
            `${response.status.toString()} - ${response.statusText}`,
            {
              description:
                "La photo de couverture doit être au format paysage !",
            },
          );
          setImage(null);
          resetField("cover");
          setError("cover", {
            type: "string",
            message: "La photo de couverture doit être au format paysage !",
          });
        } else if (response.status == 504) {
          toast.warning(
            `${response.status.toString()} - ${response.statusText}`,
            {
              description:
                "L'upload a pris trop de temps - L'événement ne s'est peut-être pas uploadé correctement",
            },
          );
        } else {
          toast.error(response.status.toString(), {
            description: response.statusText,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }
  return (
    <section>
      <h2>New Event Page</h2>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="max-w-lg space-y-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Nom de l&apos;événement</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    required
                    placeholder="Crasino"
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
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date de l&apos;événement</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Notes{" "}
                  <span className="italic text-neutral-400">
                    (facultatives)
                  </span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notes..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Ces notes seront affichées avant les photos de
                  l&apos;événement.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pinned"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Mettre en évidence
                  </FormLabel>
                  <FormDescription>
                    Ce post sera affiché en tout premier parmi les événements
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    defaultChecked={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {image && (
            <img src={image} alt="cover" className="mt-1 w-full rounded-xl" />
          )}
          <CoverInput errors={errors} register={register} setImage={setImage} />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={handleChange(field)}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {TypeList.map((key) => {
                      return (
                        <FormItem
                          key={key}
                          className="flex items-center space-x-3 space-y-0"
                        >
                          <FormControl>
                            <RadioGroupItem value={key} />
                          </FormControl>
                          <FormLabel className="font-normal hover:cursor-pointer">
                            {key}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {type === "AUTRE" ? (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="merciCPV"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <></>
          )}
          <PhotosInput errors={errors} register={register} />
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
