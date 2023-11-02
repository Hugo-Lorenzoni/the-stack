"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "../../../components/ui/use-toast";
import { TextIntro } from "@/app/page";
import { Textarea } from "../../../components/ui/textarea";

const textFormSchema = z.object({
  title: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  text: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(750, { message: "Must be 750 or fewer characters long" }),
  signature: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  date: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
});

export default function TextIntroForm({ textintro }: { textintro: TextIntro }) {
  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof textFormSchema>>({
    resolver: zodResolver(textFormSchema),
    defaultValues: {
      title: textintro.title,
      text: textintro.text.join("\n"),
      signature: textintro.signature,
      date: textintro.date,
    },
  });

  const { reset } = form;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof textFormSchema>) {
    setLoading(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    console.log(values.text.split("\n"));

    try {
      const response = await fetch("/api/admin/modificationtextintro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values, text: values.text.split("\n") }),
      });
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
          title: "Modification du texte d'introduction réussie",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
      });
    }

    setLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-4 flex max-w-xl flex-1 flex-col space-y-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Titre</FormLabel>
              <FormControl>
                <Input placeholder="Exemple : À propos" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex flex-1 flex-col">
              <FormLabel className="my-1">Texte d&apos;introduction</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texte d'introduction ..."
                  className="flex-1"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="signature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Signature</FormLabel>
              <FormControl>
                <Input placeholder="Le Cercle Photo-Vidéo (CPV)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input placeholder="Mars 2023" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
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
          onClick={() => {
            reset();
          }}
        >
          Reset
        </Button>
      </form>
    </Form>
  );
}
