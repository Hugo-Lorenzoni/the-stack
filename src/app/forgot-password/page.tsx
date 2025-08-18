"use client";
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
import { Skeleton } from "@/components/ui/skeleton";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  email: z.string().email(),
});

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<ForgotPasswordLoading />}>
      <ForgotPassword />
    </Suspense>
  );
}

function ForgotPassword() {
  const params = useSearchParams();

  const email = params.get("email") || "";

  const [isLoading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: email,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    setLoading(true);
    try {
      const apiUrlEndpoint = "/api/forgot-password";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const result = await response.json();
        console.log(result);
        toast.success("Un mail vous a été envoyé !", {
          description:
            "Cliquez sur le lien dans l'email pour réinitialiser votre mot de passe.",
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
  }
  return (
    <main className="mx-auto my-8 min-h-[calc(100vh-10rem)] max-w-md px-6">
      <h1 className="text-2xl font-semibold">Réinitialiser le mot de passe</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Entrez votre email"
                    {...field}
                  />
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
                  className="size-4 animate-spin text-white"
                />
                Envoi en cours...
              </>
            ) : (
              "Envoyer le lien de réinitialisation"
            )}
          </Button>
        </form>
      </Form>
    </main>
  );
}

function ForgotPasswordLoading() {
  return (
    <main className="mx-auto my-8 min-h-[calc(100vh-10rem)] max-w-md px-6">
      <h1 className="text-2xl font-semibold">Réinitialiser le mot de passe</h1>
      <div className="mt-4 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="text-sm leading-none">Email</div>
          <Skeleton className="h-9 w-full" />
        </div>
        <Button disabled>Envoyer le lien de réinitialisation</Button>
      </div>
    </main>
  );
}
