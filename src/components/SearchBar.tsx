"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Search } from "lucide-react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  search: z.string(),
});

export default function SearchBar() {
  const router = useRouter();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    router.push(`/search?q=${data.search}`);
    // router.refresh();
  }

  return (
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
                  className="sr-only mb-2 text-sm font-medium text-white"
                >
                  Search
                </FormLabel>
                <FormControl>
                  <Input
                    type="search"
                    id="default-search"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-4 pr-16 text-sm text-gray-900 focus:border-orange-500 focus:ring-orange-500"
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
            className="absolute right-0 bottom-0 rounded-lg bg-orange-700 px-4 py-2 text-sm font-medium text-white hover:bg-orange-800 focus:ring-4 focus:ring-orange-300 focus:outline-hidden"
          >
            <Search className="h-4 w-4 text-white" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
