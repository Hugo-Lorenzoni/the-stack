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
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

import { Event, Type } from "@prisma/client";

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
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isDialogOpen, setDialogOpen] = useState<boolean>(false);

  const [image, setImage] = useState<string | null>();

  const [failed, setFailed] = useState<File[]>([]);
  const [event, setEvent] = useState<Event>();
  const [isRetryLoading, setRetryLoading] = useState<boolean>(false);

  const [progress, setProgress] = useState(0);

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
    watch,
  } = form;
  const autreType = watch("type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setDialogOpen(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const { cover, photos, ...data } = values;
    console.log(values.photos.length);
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
        setEvent(res.event);
        console.log(res.event.date);

        const files = Array.from(values.photos).map(async (photo) => {
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
              console.log(res);
              setProgress((value) => value + (1 / values.photos.length) * 90);
              // toast(`${res.photo.name} successfully added !`);

              return { photo, status: "OK" };
            } else {
              toast.error(response.status.toString(), {
                description: response.statusText,
              });
              setFailed((prev) => [...prev, photo]);
              return { photo, status: "FAILED" };
            }
          } catch (error) {
            console.log(error);
            toast.error(`${error}`);
            setFailed((prev) => [...prev, photo]);
          }
        });
        let index = 0;
        for (let i = 0; i < files.length; i++) {
          const file = await files[i];
          if (file?.status !== "OK" || !file) {
            index++;
          }
        }
        if (index == 0) {
          toast.success(
            `All photos (${values.photos.length}) were successfully added !`,
          );
          setImage(null);
          reset();
          toast.success("Enregistrement de l'événement et des photos réussi", {
            description: "N'oubliez pas de le publier !",
          });
        } else {
          toast.info(
            `${values.photos.length - index} photos were successfully added !`,
          );
          toast.error(`${index} photos failed to be uploaded`);
        }
      } else if (response.status == 415) {
        toast.warning(
          `${response.status.toString()} - ${response.statusText}`,
          {
            description: "La photo de couverture doit être au format paysage !",
          },
        );
        setImage(null);
        resetField("cover");
        setError("cover", {
          type: "string",
          message: "La photo de couverture doit être au format paysage !",
        });
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(`${error}`);
    }
    setLoading(false);
    setProgress(0);
  }

  async function handleRetry(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();

    setRetryLoading(true);

    const files = failed.map(async (photo) => {
      const photoData = new FormData();

      // formData.append(`file-${index}`, values.photos[index]);
      photoData.append("file", photo);

      photoData.append("values", JSON.stringify(event));
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
          console.log(res);
          setProgress((value) => value + (1 / failed.length) * 100);
          setFailed((prev) => prev.filter((p) => p.name !== photo.name));

          return { photo, status: "OK" };
        } else {
          toast.error(response.status.toString(), {
            description: response.statusText,
          });
          return { photo, status: "FAILED" };
        }
      } catch (error) {
        console.log(error);
        toast.error(`${error}`);
        setFailed((prev) => [...prev, photo]);
      }
    });
    let index = 0;
    for (let i = 0; i < files.length; i++) {
      const file = await files[i];
      if (file?.status !== "OK" || !file) {
        index++;
      }
    }
    if (index == 0) {
      toast.success(`All photos (${files.length}) were successfully added !`);
      setImage(null);
      setEvent(undefined);
      reset();
      toast.success("Enregistrement de l'événement et des photos réussi", {
        description: "N'oubliez pas de le publier !",
      });
    } else {
      toast.info(`${files.length - index} photos were successfully added !`);
      toast.error(`${index} photos failed to be uploaded`);
    }
    setProgress(0);
    setRetryLoading(false);
  }
  return (
    <>
      <section>
        <h2>New Event Page</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-4 max-w-lg space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;événement</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      required
                      placeholder="Crasino"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="py-[5px]">
                    Date de l&apos;événement
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-[240px] text-left font-normal",
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
                    <span className="text-neutral-400 italic">
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
            <CoverInput
              errors={errors}
              register={register}
              setImage={setImage}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col gap-1.5"
                    >
                      {TypeList.map((key) => {
                        return (
                          <FormItem key={key} className="flex items-center">
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
            {autreType === "AUTRE" ? (
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
            <div className="flex items-center gap-2">
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2
                      color="#ffffff"
                      className="size-4 animate-spin text-white"
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
      <AlertDialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLoading || isRetryLoading || failed.length
                ? "Upload de l'événement en cours..."
                : "Enregistrement de l'événement et des photos réussi !"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLoading || isRetryLoading ? (
                <>
                  <Progress color="red" value={progress} />
                  <div>{progress < 100 ? progress.toFixed(0) : 100} %</div>
                </>
              ) : (
                ""
              )}
              {failed.length ? (
                <div className="mt-4 max-w-lg rounded-lg border-2 border-red-600 bg-red-200 px-4 py-2 text-red-600">
                  <h5 className="mb-2">
                    Ces photos ne se sont pas uploadées :
                  </h5>
                  {failed.map((photo) => (
                    <p key={photo.name}>{photo.name}</p>
                  ))}
                  <Button
                    type="button"
                    onClick={(e) => handleRetry(e)}
                    variant="destructive"
                    className="mt-2"
                    disabled={isLoading || isRetryLoading}
                  >
                    {isRetryLoading ? (
                      <>
                        <Loader2
                          color="#ffffff"
                          className="size-4 animate-spin text-white"
                        />
                        Loading
                      </>
                    ) : (
                      "Réessayer"
                    )}
                  </Button>
                </div>
              ) : (
                ""
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {/* <AlertDialogCancel>Cancel</AlertDialogCancel> */}
            {isLoading || isRetryLoading || failed.length ? (
              ""
            ) : (
              <AlertDialogAction>Terminé</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
