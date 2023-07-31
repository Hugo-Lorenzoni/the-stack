"use client";
import Link from "next/link";
import Image from "next/image";
import AuthButton from "./AuthButton";
import { useSession } from "next-auth/react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "./ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/form";
import prisma from "@/lib/prisma";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  search: z.string(),
});

export default function Nav() {
  const { data: session } = useSession();
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push(`/search?search=${data.search}`);
    // try {
    //   const apiUrlEndpoint = `http://localhost:3000/api/search?search=${data.search}`;
    //   const postData = {
    //     method: "GET",
    //     headers: { "Content-Type": "application/json" },
    //   };
    //   const response = await fetch(apiUrlEndpoint, postData);
    //   console.log(response);
    //   const res = await response.json();
    //   toast({
    //     title: "You submitted the following values:",
    //     description: (
    //       <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
    //         <code className="text-white">{JSON.stringify(res, null, 2)}</code>
    //       </pre>
    //     ),
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
  }

  const linkStyle =
    "relative after:absolute after:bg-white after:w-0 after:h-[0.15rem] after:-bottom-1 after:left-0 after:rounded-full hover:after:w-full after:duration-500";

  return (
    <header className="bg-orange-600 text-white font-semibold">
      <nav className="container h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex text-4xl font-bold items-center gap-2 hover:opacity-90 duration-150"
        >
          <Image
            src="/cpv-logo.png"
            width={50}
            height={50}
            alt="CPV FPMs logo"
            priority
          />
          CPV
        </Link>
        <ul className="flex gap-6">
          <li className="flex items-center">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="relative">
                  <FormField
                    control={form.control}
                    name="search"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel
                          htmlFor="default-search"
                          className="mb-2 text-sm font-medium text-white sr-only "
                        >
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="search"
                            id="default-search"
                            className="block w-full p-4 pr-16 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-orange-500 focus:border-orange-500 "
                            placeholder="Search"
                            required
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="text-white absolute right-0 bottom-0 bg-orange-700 hover:bg-orange-800 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2 "
                  >
                    <Search className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </form>
            </Form>
          </li>

          <li className="flex items-center">
            <Link className={linkStyle} href="/events">
              Événements ouverts
            </Link>
          </li>
          {session &&
          (session.user?.role === "BAPTISE" ||
            session.user?.role === "ADMIN") ? (
            <li className="flex items-center">
              <Link className={linkStyle} href="/fpmsevents">
                Événements baptisés
              </Link>
            </li>
          ) : (
            <></>
          )}
          <li className="flex items-center">
            <Link className={linkStyle} href="/autresevents">
              Autres
            </Link>
          </li>
          {session && session.user?.role === "ADMIN" ? (
            <li className="flex items-center">
              <Link className={linkStyle} href="/admin">
                CPV
              </Link>
            </li>
          ) : (
            <></>
          )}
          <li className="flex items-center">
            <AuthButton session={session} />
          </li>
        </ul>
      </nav>
    </header>
  );
}
