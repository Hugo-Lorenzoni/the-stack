import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Video } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { CalendarIcon, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type Props = {
  row: Row<Video>;
};

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  url: z
    .string()
    .url()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(50, { message: "Must be 50 or fewer characters long" })
    .trim(),
  date: z.date(),
});

export default function VideosRowActions({ row }: Props) {
  const [video, setVideo] = useState<Video | null>(row.original);

  const [isLoading, setLoading] = useState(false);
  const [modalIsOpen, setModalOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: video?.name,
      date: video?.date,
      url: video?.url,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const data = { ...values, id: video?.id };

    setLoading(true);
    try {
      const apiUrlEndpoint = "/api/admin/video";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 500) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
      }
      if (response.status == 200) {
        const result = await response.json();

        setVideo(result);
        console.log(result);
        router.refresh();
        toast({
          variant: "default",
          title: "Modification de la vidéo réussie",
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setModalOpen(false);
  }

  async function deleteVideo(
    e: React.MouseEvent<HTMLButtonElement>,
    id: string
  ) {
    e.preventDefault();
    setLoading(true);
    console.log(video);
    try {
      const apiUrlEndpoint = "/api/admin/deletevideo";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(id),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 500) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
      }
      if (response.status == 200) {
        const name = await response.json();
        toast({
          variant: "default",
          title: "Suppression de la photo réussie",
          description: `${name} a été supprimé !`,
        });
        if (video !== null) {
          setVideo(null);
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <>
      {video ? (
        <>
          <Dialog open={modalIsOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Pencil className="w-4 h-4" />
                <span className="pl-2">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Modification de la vidéo</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 max-w-lg"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Nom du la vidéo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            required
                            placeholder="Nouvelle vidéo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Lien de la vidéo</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            required
                            placeholder="https://www.youtube.com/watch?v=hUl2oQ4AOzc"
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
                        <FormLabel>Date de la vidéo</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
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
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter className="mt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2
                            color="#ffffff"
                            className="h-4 w-4 animate-spin mr-2 text-white"
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
          <Button
            onClick={(e) => deleteVideo(e, video.id)}
            className="bg-red-600 text-red-100 hover:bg-red-800"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </>
      ) : (
        <Button disabled className="bg-red-100 text-red-600">
          <X className="w-4 h-4 mr-2" />
          Deleted
        </Button>
      )}
    </>
  );
}