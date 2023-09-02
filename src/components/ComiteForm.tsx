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
import { Data } from "@/app/admin/comite/page";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "./ui/use-toast";

const comiteFormSchema = z.object({
  president: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  responsableVideo: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  responsablePhoto: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  delegueVideo: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
  deleguePhoto: z
    .string()
    .min(2, { message: "Must be 2 or more characters long" })
    .max(30, { message: "Must be 30 or fewer characters long" }),
});

export default function ComiteForm({ data }: { data: Data }) {
  const { toast } = useToast();
  const [isLoading, setLoading] = useState(false);
  // 1. Define your form.
  const form = useForm<z.infer<typeof comiteFormSchema>>({
    resolver: zodResolver(comiteFormSchema),
    defaultValues: {
      president: data.president,
      responsableVideo: data.responsableVideo,
      responsablePhoto: data.responsablePhoto,
      delegueVideo: data.delegueVideo,
      deleguePhoto: data.deleguePhoto,
    },
  });

  const { reset } = form;

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof comiteFormSchema>) {
    setLoading(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    try {
      const response = await fetch("/api/admin/modificationcomite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
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
          title: "Modification du comité réussie",
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
        className="space-y-2 mt-4 max-w-xl"
      >
        <FormField
          control={form.control}
          name="president"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Président</FormLabel>
              <FormControl>
                <Input placeholder="Président" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="responsableVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable Vidéo</FormLabel>
              <FormControl>
                <Input placeholder="Responsable Vidéo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="responsablePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsable Photo</FormLabel>
              <FormControl>
                <Input placeholder="Responsable Photo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="delegueVideo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Délégué Vidéo</FormLabel>
              <FormControl>
                <Input placeholder="Délégué Vidéo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="deleguePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Délégué Photo</FormLabel>
              <FormControl>
                <Input placeholder="Délégué Photo" {...field} />
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
                className="h-4 w-4 animate-spin mr-2 text-white"
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
            reset();
          }}
        >
          Reset
        </Button>
      </form>
    </Form>
  );
}
