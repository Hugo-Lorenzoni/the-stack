import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { User } from "./columns";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Loader2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

type EditUserProps = {
  rowUser: User;
};

const RoleList = ["ADMIN", "BAPTISE", "USER", "WAITING"] as const;

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(RoleList),
});

export default function EditUser({ rowUser }: EditUserProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(rowUser);
  const [modalIsOpen, setModalOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email,
      role: user?.role,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    setLoading(true);
    try {
      const apiUrlEndpoint = "http://localhost:3000/api/admin/user";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
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
        const result = await response.json();
        console.log(result);
        router.refresh();
        toast({
          variant: "default",
          title: "Modification du rôle réussie",
          description: `${result.email} a été changé en ${result.role}`,
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
      {user ? (
        <Dialog open={modalIsOpen} onOpenChange={setModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="pr-2">Edit</span>
              <Pencil className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modification de l&apos;utilisateur</DialogTitle>
              <DialogDescription>
                Vous pouvez modifier le rôle d&apos;un utilisateur.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rôle</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a verified email to display" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RoleList.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-red-600">
                        Attention : Modifier le rôle d&apos;un utilisateur
                        modifie son accès aux différentes catégories
                        d&apos;événements
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter className="mt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2
                          color="#ffffff"
                          className="h-4 w-4 animate-spin mr-2 text-white"
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
      ) : (
        ""
      )}
    </>
  );
}
