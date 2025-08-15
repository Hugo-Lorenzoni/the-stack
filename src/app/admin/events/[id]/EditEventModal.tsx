import { Type } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Noop, RefCallBack, useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { CalendarIcon, Loader2, Pencil } from "lucide-react";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

const TypeList = ["BAPTISE", "OUVERT", "AUTRE"] as const;

const formSchema = z
  .object({
    title: z
      .string()
      .min(2, { message: "Must be 2 or more characters long" })
      .max(50, { message: "Must be 50 or fewer characters long" })
      .trim(),
    date: z.date(),
    pinned: z.boolean(),
    type: z.enum(TypeList),
    password: z.string().optional(),
    notes: z
      .string()
      .max(750, { message: "Must be 750 or fewer characters long" })
      .trim()
      .optional(),
  })
  .refine((data) => data.type != "AUTRE" || data.password, {
    message: "Un mot de passe est requis pour les événement de type AUTRE",
    path: ["password"], // path of error
  });

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: Date;
  eventPinned: boolean;
  eventType: Type;
  eventPassword: string | undefined;
  eventNotes: string | undefined;
};

export default function EditEventModal({
  eventId,
  eventTitle,
  eventPinned,
  eventDate,
  eventType,
  eventPassword,
  eventNotes,
}: Props) {
  const [isLoading, setLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const [type, setType] = useState<Type>(eventType);

  // Add 12 hours to the event date
  const initDate = new Date(eventDate);
  initDate.setHours(eventDate.getHours() + 12);

  function handleChange(field: {
    onChange: any;
    onBlur?: Noop;
    value: any;
    name?: "type";
    ref?: RefCallBack;
  }) {
    if (field.onChange) {
      if (field.value != undefined) {
        setType(field?.value);
      }
    }
    return field.onChange;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: eventTitle,
      date: eventDate,
      pinned: eventPinned,
      type: eventType,
      password: eventPassword,
      notes: eventNotes,
    },
  });

  const {
    formState: { isDirty },
    reset,
  } = form;

  useEffect(() => {
    if (!isModalOpen && isDirty) {
      reset();
    }
  }),
    [isModalOpen];

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const data = { ...values, id: eventId };

    setLoading(true);
    try {
      const apiUrlEndpoint = "/api/admin/event/update";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const result = await response.json();

        //! setVideo(result);
        console.log(result);
        window.location.reload();
        // router.refresh();
        toast.success("Modification de l'événement réussie");
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setModalOpen(false);
  }

  return (
    <>
      <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
        <DialogTrigger asChild>
          <Button>
            <Pencil className="h-4 w-4" />
            <span className="pl-2">Edit</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-lg space-y-4"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Nom de l&apos;événement</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        required
                        placeholder="Crasino"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date de l&apos;événement</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Notes{" "}
                      <span className="italic text-neutral-400">
                        (facultatives)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notes..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ces notes seront affichées avant les photos de
                      l&apos;événement.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Mettre en évidence
                      </FormLabel>
                      <FormDescription>
                        Ce post sera affiché en tout premier parmi les
                        événements
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        defaultChecked={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={handleChange(field)}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        {TypeList.map((key) => {
                          return (
                            <FormItem
                              key={key}
                              className="flex items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <RadioGroupItem value={key} />
                              </FormControl>
                              <FormLabel className="font-normal hover:cursor-pointer">
                                {key}
                              </FormLabel>
                            </FormItem>
                          );
                        })}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === "AUTRE" ? (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          required
                          placeholder="merciCPV"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <></>
              )}
              <DialogFooter className="mt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2
                        color="#ffffff"
                        className="mr-2 h-4 w-4 animate-spin text-white"
                      />
                      En cours
                    </>
                  ) : (
                    "Appliquer"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
