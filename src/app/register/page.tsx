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
              <Alert className="bg-red-100 text-red-600 border-red-600 border-2">
                <svg
                  className="fill-red-600"
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z"
                    fill="#dc2626"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <AlertTitle>Attention</AlertTitle>
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
