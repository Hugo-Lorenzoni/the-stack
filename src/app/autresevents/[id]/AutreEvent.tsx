"use client";

import { useState } from "react";
import Gallery from "@/components/Gallery";
import { Photo, Sponsor } from "@prisma/client";
import Image from "next/image";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "../../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form";
import { Input } from "../../../components/ui/input";
import { useToast } from "../../../components/ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const formSchema = z
  .object({
    password: z.string().min(1, { message: "Aucun mot de passe entré" }),
  })
  .required();

type Event = {
  id: string;
  title: string;
  date: Date;
  notes?: string | null;
  pinned: boolean;
  coverName: string;
  coverUrl: string;
  coverWidth: number;
  coverHeight: number;
  photos: Photo[];
  sponsors: Sponsor[];
} | null;

type Info = {
  id: string;
  title: string;
  date: Date;
  coverName: string;
  coverUrl: string;
  coverWidth: number;
  coverHeight: number;
} | null;

export default function AutreEvent(props: { info: Info; event: Event }) {
  const [event, setEvent] = useState<Event | null>(props.event);
  const [isForbidden, setForbidden] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState("password");

  const { toast } = useToast();

  const info = props.info;

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    try {
      const apiUrlEndpoint = `/api/passwordcheck/${info?.id}`;
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        next: { revalidate: 60 * 60 }, //1h
        body: JSON.stringify(values),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      // console.log(response);
      if (response.status == 500) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
        setForbidden(false);
      }
      if (response.status == 403) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
        setForbidden(true);
      }
      if (response.status == 200) {
        toast({
          variant: "default",
          title: "Mot de passe correct",
          description:
            "Vous pouvez maintenant acceder aux photos de l'événement",
        });
        const res = await response.json();
        setForbidden(false);
        setEvent(res);
      }
    } catch (error) {
      console.log(error);
    }
  }

  // console.log(event);

  return (
    <main className="container my-8 min-h-[calc(100vh_-_10rem)]">
      {event ? (
        <>
          <h1 className="relative w-fit text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
            {event.title}
          </h1>
          <p className="mt-4 text-right italic">{event.photos.length} photos</p>
          {event.notes && <p className="mt-4">{event.notes}</p>}
          <Gallery eventName={event.title} photos={event.photos} />
        </>
      ) : (
        <>
          {info && (
            <section className="relative h-[calc(100vh_-_10rem)] overflow-hidden rounded-2xl">
              <Image
                className="h-full w-full object-cover blur-[1px] brightness-75 "
                src={info.coverUrl}
                width={info.coverWidth}
                height={info.coverHeight}
                alt={info.coverName}
                priority
              />
              <div className="absolute bottom-0 left-0 right-0 m-4  mx-auto h-fit max-w-xl ">
                <div className="mx-4 rounded-xl bg-white px-8 py-6 shadow-2xl">
                  <h1 className="relative mb-4 w-fit text-3xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
                    {info.title}
                  </h1>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-2 "
                    >
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => {
                          return (
                            <FormItem>
                              <FormLabel>Mot de passe</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    className="pr-16"
                                    type={showPassword}
                                    placeholder="Mot de passe"
                                    {...field}
                                  />
                                </FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="absolute bottom-0 right-0"
                                  onClick={() =>
                                    setShowPassword((prev) =>
                                      prev == "password" ? "text" : "password",
                                    )
                                  }
                                >
                                  {showPassword == "password" ? (
                                    <>
                                      <span className="sr-only mr-2">
                                        Show password
                                      </span>
                                      <Eye />
                                    </>
                                  ) : (
                                    <>
                                      <span className="sr-only mr-2">
                                        Hide password
                                      </span>
                                      <EyeOff />
                                    </>
                                  )}
                                </Button>
                              </div>
                              <p className="text-sm text-red-600">
                                {isForbidden && "Mot de passe incorrect"}
                              </p>
                              <FormMessage />
                            </FormItem>
                          );
                        }}
                      />
                      <Button type="submit">Submit</Button>
                    </form>
                  </Form>
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}
