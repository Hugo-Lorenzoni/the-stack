"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Eye, EyeOff, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import Link from "next/link";

const formSchema = z.object({
  email: z.string(),
  password: z.string(),
});

export default function ConnectionPage() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState("password");

  const router = useRouter();

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
          toast.info("Vous êtes maintenant connecté");
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
          toast.error("Erreur lors de la connexion", {
            description: "Nom d'utilisateur ou mot de passe incorrect",
          });
        } else {
          toast.error(results.status.toString(), {
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
    <main className="relative mx-auto my-8 min-h-[calc(100vh-10rem)] max-w-lg px-6">
      <div className="absolute top-1/3 left-1/2 w-full -translate-x-1/2 -translate-y-1/2 px-3">
        <div className="rounded-2xl border-2 border-orange-600 p-6 shadow-xl">
          <h1 className="text-2xl font-semibold">Connexion</h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-4 space-y-4"
            >
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
                      <div className="relative">
                        <Input
                          required
                          type={showPassword}
                          placeholder="Mot de passe"
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="absolute right-0 bottom-0"
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
                    </FormControl>
                    <FormMessage />
                    <FormDescription className="text-right text-xs italic">
                      Vous avez oublié votre mot de passe ? <br />
                      <Link
                        href={`/forgot-password?email=${form.watch("email")}`}
                        className="text-orange-600 hover:underline"
                      >
                        Cliquez ici pour le réinitialiser.
                      </Link>
                    </FormDescription>
                  </FormItem>
                )}
              />
              <Button disabled={isLoading} type="submit">
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    En cours de connexion
                  </>
                ) : (
                  "Connexion"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </main>
  );
}
