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
import { toast } from "sonner";
import Link from "@/components/Link";
import { authClient } from "@/lib/auth-client";

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
    try {
      const results = await authClient.signIn.email({
        email: values.email,
        password: values.password,
        rememberMe: true,
      });

      if (results.error) {
        toast.error("Erreur lors de la connexion", {
          description: results.error.message,
        });
        setLoading(false);
        return;
      }

      const currentSession = await authClient.getSession();
      const currentRole = (
        currentSession.data?.user as { role?: string } | undefined
      )?.role;

      toast.info("Vous êtes maintenant connecté");
      if (currentRole === "ADMIN") {
        router.push("/admin");
      } else if (currentRole === "WAITING") {
        router.push("/register/waiting");
      } else {
        router.push("/");
      }
      router.refresh();
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
