"use client";

import { toast } from "sonner";

import { useState } from "react";

import { Cercle } from "@prisma/client";

import { Row } from "@tanstack/react-table";

import { Button } from "@/components//ui/button";

export type User = {
  id: string;
  email: string;
  name: string;
  surname: string;
  cercle: Cercle | string;
  ville: string;
  promo: number | null;
};

export default function ApprovalRowActions(props: { row: Row<User> }) {
  const [user, setUser] = useState<User | null>(props.row.original);

  async function handleChange(
    e: React.MouseEvent<HTMLButtonElement>,
    user: User,
    url: string,
  ) {
    e.preventDefault();
    console.log(user);
    try {
      const apiUrlEndpoint = `/api/admin/${url}`;
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      if (response.status == 200) {
        const role = await response.json();
        toast.success("Modification du compte réussie", {
          description: `Il est maintenant ${role}`,
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
  }
  if (user) {
    return (
      <>
        <Button
          className="w-full cursor-pointer bg-green-600 text-white hover:bg-green-100 hover:text-green-600"
          onClick={(e) => handleChange(e, user, "acceptuser")}
        >
          Accepter
        </Button>
        <Button
          className="ml-2 w-full cursor-pointer bg-red-600 text-white hover:bg-red-100 hover:text-red-600"
          onClick={(e) => handleChange(e, user, "rejectuser")}
        >
          Refuser
        </Button>
      </>
    );
  }
}
