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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Button } from "@/components/ui/button";

import { toast } from "sonner";

import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { User } from "./columns";

import { Loader2, Pencil, Trash2, X } from "lucide-react";

type EditUserProps = {
  rowUser: User;
};

const RoleList = ["ADMIN", "BAPTISE", "USER", "WAITING"] as const;

const formSchema = z.object({
  email: z.string().email(),
  role: z.enum(RoleList),
});

export default function EditUser({ rowUser }: EditUserProps) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(rowUser);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);

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
      const apiUrlEndpoint = "/api/admin/user";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const result = await response.json();
        console.log(result);
        router.refresh();
        toast.success("Modification du rôle réussie", {
          description: `${result.email} a été changé en ${result.role}`,
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
    setModalOpen(false);
  }

  async function deleteUser(
    e: React.MouseEvent<HTMLButtonElement>,
    user: User,
  ) {
    e.preventDefault();
    setLoading(true);
    console.log(user);
    try {
      const apiUrlEndpoint = "/api/admin/user";
      const postData = {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user.email),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);

      if (response.status == 200) {
        const result = await response.json();
        toast.success("Suppression de l'utilisateur réussie", {
          description: `${result.surname} ${result.name} a été supprimé !`,
        });
        setUser(null);
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    setAlertOpen(false);
  }

  return (
    <>
      {user ? (
        <>
          <Dialog open={isModalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <span className="pr-2">Edit</span>
                <Pencil className="h-4 w-4" />
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
          <AlertDialog onOpenChange={setAlertOpen} open={isAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                className="ml-2 bg-red-600 text-red-100 hover:bg-red-800"
                disabled={isLoading}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Cette suppression est irréversible. Cet utilisateur sera
                  supprimé de manière permanente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isLoading}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-600 hover:bg-red-500"
                  onClick={(e) => deleteUser(e, user)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2
                        color="#ffffff"
                        className="mr-2 h-4 w-4 animate-spin text-white"
                      />
                      En cours
                    </>
                  ) : (
                    "Supprimer"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ) : (
        <Button disabled className="bg-red-100 text-red-600">
          <X className="mr-2 h-4 w-4" />
          Deleted
        </Button>
      )}
    </>
  );
}
