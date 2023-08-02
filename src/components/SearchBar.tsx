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
                  className="mb-2 text-sm font-medium text-white sr-only "
                >
                  Search
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
  );
}
