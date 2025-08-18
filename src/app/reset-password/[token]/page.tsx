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
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { use, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = z.object({
  password: z
    .string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(
      new RegExp(".*[A-Z].*"),
      "Le mot de passe doit contenir au moins une majuscule",
    )
    .regex(
      new RegExp(".*[a-z].*"),
      "Le mot de passe doit contenir au moins une minuscule",
    )
    .regex(
      new RegExp(".*\\d.*"),
      "Le mot de passe doit contenir au moins un chiffre",
    ),
});

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);

  const [showPassword, setShowPassword] = useState("password");
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    setLoading(true);
    const body = {
      ...values,
      token,
    };

    try {
      const apiUrlEndpoint = "/api/reset-password";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const result = await response.json();
        console.log(result);
        router.push("/connexion");
        toast.success("Modification du mot de passe réussie", {
          description:
            "Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.",
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
      <h1 className="text-2xl font-semibold">Récupération du compte</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mot de passe</FormLabel>
                <FormControl>
                  <div className="relative max-w-sm">
                    <Input
                      className="pr-16"
                      type={showPassword}
                      placeholder="Nouveau mot de passe"
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
                          <span className="sr-only mr-2">Show password</span>
                          <Eye />
                        </>
                      ) : (
                        <>
                          <span className="sr-only mr-2">Hide password</span>
                          <EyeOff />
                        </>
                      )}
                    </Button>
                  </div>
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
                Modification du mot de passe en cours
              </>
            ) : (
              "Modifer le mot de passe"
            )}
          </Button>
        </form>
      </Form>
    </main>
  );
}
