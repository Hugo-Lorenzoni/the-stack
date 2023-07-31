"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Cercle } from "@prisma/client";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components//ui/button";
import { HelpCircle } from "lucide-react";

export type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  cercle: Cercle | string;
  ville: string;
  promo: number | null;
};

export default function RowActions(props: { row: Row<User> }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(props.row.original);

  async function handleChange(
    e: React.MouseEvent<HTMLButtonElement>,
    user: User,
    url: string
  ) {
    e.preventDefault();
    console.log(user);
    try {
      const apiUrlEndpoint = `http://localhost:3000/api/admin/${url}`;
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
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
        const role = await response.json();
        toast({
          variant: "default",
          title: "Modification du compte réussie",
          description: `Il est maintenant ${role}`,
        });
        setUser(null);
      }
    } catch (error) {
      console.log(error);
    }
  }
  if (user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="h-8 w-8 p-0">
            <span className="sr-only">Approuver ?</span>
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="space-y-1">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Button
              className="w-full cursor-pointer bg-green-600 text-white hover:bg-green-100 hover:text-green-600"
              onClick={(e) => handleChange(e, user, "acceptuser")}
            >
              Accepter
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Button
              className="w-full cursor-pointer bg-red-600 text-white hover:bg-red-100 hover:text-red-600"
              onClick={(e) => handleChange(e, user, "rejectuser")}
            >
              Refuser
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
}

// "use client";
// import { useToast } from "@/components/ui/use-toast";
// import { useState } from "react";
// import { Cercle } from "@prisma/client";
// import { Row } from "@tanstack/react-table";
// import { Button } from "@/components//ui/button";
// import { HelpCircle } from "lucide-react";

// export type User = {
//   id: string;
//   email: string;
//   name: string;
//   surname: string;
//   cercle: Cercle | string;
//   ville: string;
//   promo: number | null;
// };

// export default function RowActions(props: { row: Row<User> }) {
//   const { toast } = useToast();
//   const [user, setUser] = useState<User | null>(props.row.original);

//   async function handleChange(
//     e: React.MouseEvent<HTMLButtonElement>,
//     user: User,
//     url: string
//   ) {
//     e.preventDefault();
//     console.log(user);
//     try {
//       const apiUrlEndpoint = `http://localhost:3000/api/admin/${url}`;
//       const postData = {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(user),
//       };
//       const response = await fetch(apiUrlEndpoint, postData);
//       console.log(response);
//       if (response.status == 500) {
//         toast({
//           variant: "destructive",
//           title: response.status.toString(),
//           description: response.statusText,
//         });
//       }
//       if (response.status == 200) {
//         const role = await response.json();
//         toast({
//           variant: "default",
//           title: "Modification du compte réussie",
//           description: `Il est maintenant ${role}`,
//         });
//         setUser(null);
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   }
//   if (user) {
//     return (
//       <>
//         <Button
//           className="mr-2 cursor-pointer bg-green-600 text-white hover:bg-green-100 hover:text-green-600"
//           onClick={(e) => handleChange(e, user, "acceptuser")}
//         >
//           Accepter
//         </Button>

//         <Button
//           className=" cursor-pointer bg-red-600 text-white hover:bg-red-100 hover:text-red-600"
//           onClick={(e) => handleChange(e, user, "rejectuser")}
//         >
//           Refuser
//         </Button>
//       </>
//     );
//   }
// }
