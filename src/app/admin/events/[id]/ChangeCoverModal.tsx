import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Loader2, Image as Picture } from "lucide-react";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NewCoverInput } from "./NewCoverInput";
import ImageComponent from "@/components/ImageComponent";
import { Input } from "@/components/ui/input";

const MAX_FILE_SIZE = 10000000;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const formSchema = z.object({
  id: z.string().min(1, "Event ID is required."),
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
});

type Props = {
  eventId: string;
  eventCoverName: string;
  eventCoverUrl: string;
  eventCoverWidth: number;
  eventCoverHeight: number;
};

export default function ChangeCoverModal({
  eventId,
  eventCoverName,
  eventCoverUrl,
  eventCoverWidth,
  eventCoverHeight,
}: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [cover, setCover] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: eventId,
    },
  });

  const {
    formState: { isDirty, errors },
    reset,
    register,
    resetField,
    setError,
  } = form;

  useEffect(() => {
    if (!isModalOpen && isDirty) {
      reset();
      setCover(null);
    }
  }, [isModalOpen, isDirty, reset, setCover]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const { cover, ...data } = values;

    const formData = new FormData();

    formData.append("cover", cover[0]);
    formData.append("values", JSON.stringify(data));

    try {
      const apiUrlEndpoint = "/api/admin/changecover";
      const postData = {
        method: "POST",
        body: formData,
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const result = await response.json();

        console.log(result);
        window.location.reload();
        toast.success("Modification de l'image de couverture réussie");
      } else if (response.status == 415) {
        toast.warning(
          `${response.status.toString()} - ${response.statusText}`,
          {
            description: "La photo de couverture doit être au format paysage !",
          },
        );
        setCover(null);
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
    }
    setLoading(false);
    setModalOpen(false);
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Picture className="size-4" />
            Changer la photo de couverture
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Changer la photo de couverture</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm">
            <div>Photo de couverture actuelle</div>
            <ImageComponent
              alt={eventCoverName}
              src={eventCoverUrl}
              width={eventCoverWidth}
              height={eventCoverHeight}
              quality="thumbnail"
              className="rounded-xl"
            />
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-lg space-y-4"
            >
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input
                        type="text"
                        required
                        {...field}
                        className="hidden"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {cover && (
                <div className="space-y-2 text-sm">
                  <div>Nouvelle photo de couverture</div>
                  <img
                    src={cover}
                    alt="cover"
                    className="mt-1 w-full rounded-xl"
                  />
                </div>
              )}
              <NewCoverInput
                errors={errors}
                register={register}
                setImage={setCover}
              />
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2
                        color="#ffffff"
                        className="size-4 animate-spin text-white"
                      />
                      En cours
                    </>
                  ) : (
                    "Appliquer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
