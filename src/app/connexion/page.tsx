"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function ConnectionPage() {
  const [isLoading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    try {
      const results = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/",
      });
      console.log(results);
      if (results) {
        if (results.ok && results.url) {
          const res = await getSession();
          if (res?.user?.role == "ADMIN") {
            router.push("/admin");
            router.refresh();
          } else if (res?.user?.role == "WAITING") {
            router.push("/register/waiting");
            router.refresh();
          } else {
            router.push(results.url);
            router.refresh();
          }
        } else if (results.error == "CredentialsSignin") {
          toast({
            variant: "destructive",
            title: "Erreur lors de la connexion",
            description: "Nom d'utilisateur ou mot de passe incorrect",
          });
        } else {
          toast({
            variant: "destructive",
            title: results.status.toString(),
            description: results.error
              ? results.error.toString()
              : results.url?.toString(),
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  return (
    <main className="max-w-lg mx-auto px-6 my-8 min-h-[calc(100vh_-_10rem)] relative">
      <div className="absolute w-full top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border-2 border-orange-600 p-6 shadow-xl">
        <h1 className="font-semibold text-2xl">Connexion</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      required
                      placeholder="example@gmail.com"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input required type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  En cours de connexion
                </>
              ) : (
                "Connexion"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </main>
  );
}
