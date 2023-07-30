"use client";
import { Noop, RefCallBack, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

const enumCercle = [
  "FPMS",
  "WAWA",
  "FMM",
  "CEFUC",
  "ISIC",
  "ISIMS",
  "ARCHI",
  "AUTRE",
];

const formSchema = z
  .discriminatedUnion("check", [
    z
      .object({
        email: z.string().email({ message: "Invalid email address" }),
        password: z
          .string()
          .min(4, { message: "Must be 4 or more characters long" })
          .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
          .regex(new RegExp(".*[a-z].*"), "One lowercase character")
          .regex(new RegExp(".*\\d.*"), "One number"),
        confirmPassword: z.string(),
        name: z
          .string()
          .min(2, { message: "Must be 2 or more characters long" })
          .max(50, { message: "Must be 50 or fewer characters long" })
          .trim(),
        surname: z
          .string()
          .min(2, { message: "Must be 2 or more characters long" })
          .max(50, { message: "Must be 50 or fewer characters long" })
          .trim(),
        check: z.literal(false),
      })
      .required(),
    z.object({
      email: z.string().email({ message: "Invalid email address" }),
      password: z
        .string()
        .min(4, { message: "Must be 4 or more characters long" })
        .regex(new RegExp(".*[A-Z].*"), "One uppercase character")
        .regex(new RegExp(".*[a-z].*"), "One lowercase character")
        .regex(new RegExp(".*\\d.*"), "One number"),
      confirmPassword: z.string(),
      name: z
        .string()
        .min(2, { message: "Must be 2 or more characters long" })
        .max(50, { message: "Must be 50 or fewer characters long" })
        .trim(),
      surname: z
        .string()
        .min(2, { message: "Must be 5 or more characters long" })
        .max(50, { message: "Must be 50 or fewer characters long" })
        .trim(),
      check: z.literal(true),
      cercle: z.enum([
        "FPMS",
        "WAWA",
        "FMM",
        "CEFUC",
        "ISIC",
        "ISIMS",
        "ARCHI",
        "AUTRE",
      ]),
      autreCercle: z.string().optional(),
      cercleVille: z.string().optional(),
      promo: z.number(),
    }),
  ])
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"], // path of error
  });

//type FormData =z.infer<typeof formSchema>

export default function RegisterPage() {
  const [check, setChecked] = useState(false);
  const [cercle, setCercle] = useState(undefined);

  const { toast } = useToast();
  const router = useRouter();

  function handleCheck(field: {
    onChange: any;
    onBlur?: Noop;
    value?: boolean;
    name?: "check";
    ref?: RefCallBack;
  }) {
    if (field.onChange) {
      if (field.value != undefined) {
        setChecked(field?.value);
      }
    }
    return field.onChange;
  }
  function handleChange(field: {
    onChange: any;
    onBlur?: Noop;
    value: any;
    name?: "cercle";
    ref?: RefCallBack;
  }) {
    if (field.onChange) {
      if (field.value != undefined) {
        setCercle(field?.value);
      }
    }
    return field.onChange;
  }
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      surname: "",
      check: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    const { confirmPassword, ...requestValues } = values;
    try {
      const apiUrlEndpoint = `http://localhost:3000/api/register`;
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestValues),
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
        toast({
          variant: "default",
          title: "Enregistrement du compte réussie",
          description: "Vous pouvez maintenant vous connecter",
        });
        router.push("/connexion");
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className="max-w-md mx-auto px-6 my-8 min-h-[calc(100vh_-_10rem)]">
      <h1 className="font-semibold text-2xl">Création de compte</h1>
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input type="text" required placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surname"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input type="text" required placeholder="Nom" {...field} />
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
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmer votre mot de passe</FormLabel>
                <FormControl>
                  <Input required type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="check"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={handleCheck(field)}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="cursor-pointer">
                    Je suis baptisé
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          {check ? (
            <>
              <Alert className="bg-red-100 text-red-600 border-red-600 border-2 [&:has(svg)]:pl-4 py-3">
                <AlertTitle className="flex items-center">
                  <AlertTriangle className="text-red-600 mr-2" />
                  Attention
                </AlertTitle>
                <AlertDescription>
                  Attention : une vérification humaine sera effectuée ! <br />
                  Ton compte ne sera pas approuvé si tu n&apos;es pas
                  baptisé(e).
                </AlertDescription>
              </Alert>
              <FormField
                control={form.control}
                name="cercle"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Cercle</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={handleChange(field)}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {enumCercle.map((key) => {
                          return (
                            <>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value={key} />
                                </FormControl>
                                <FormLabel className="font-normal hover:cursor-pointer">
                                  {key}
                                </FormLabel>
                              </FormItem>
                            </>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {cercle === "AUTRE" ? (
                <>
                  <FormField
                    control={form.control}
                    name="autreCercle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom de votre Cercle</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            required
                            placeholder="Exemple : Cercle des Sciences"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cercleVille"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville de votre Cercle</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            required
                            placeholder="Bruxelles"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="promo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Promo*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            required
                            placeholder="Exemple : 183 ou 2020"
                            {...field}
                            onChange={(event) =>
                              field.onChange(+event.target.value)
                            }
                          />
                        </FormControl>
                        <FormDescription>*Année de bâptème</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="promo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Promo*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          required
                          placeholder="Exemple : 183 ou 2020"
                          {...field}
                          onChange={(event) =>
                            field.onChange(+event.target.value)
                          }
                        />
                      </FormControl>
                      <FormDescription>*Année de bâptème</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          ) : (
            <></>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </main>
  );
}
