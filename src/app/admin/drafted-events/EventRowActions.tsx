"use client";
import { toast } from "sonner";

import { useState } from "react";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

import { Event } from "@/app/admin/drafted-events/columns";
import { Check, Eye, Send } from "lucide-react";

import Link from "@/components/Link";

export default function EventRowActions(props: { row: Row<Event> }) {
  const [event, setEvent] = useState<Event | null>(props.row.original);

  async function handleChange(
    e: React.MouseEvent<HTMLButtonElement>,
    event: Event,
  ) {
    e.preventDefault();
    try {
      const apiUrlEndpoint = "/api/admin/publishevent";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      const published = await response.json();
      console.log(published);

      if (response.status == 200 && published) {
        toast.success("Publication réussie", {
          description: `L'événement ${event.title} est maintenant publié`,
        });
        setEvent(null);
      } else {
        toast.error(response.status.toString(), {
          description: response.statusText,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {event ? (
        <>
          <Button className="mr-2" asChild>
            <Link href={`/admin/events/${event.id}`}>
              <Eye className="size-4" />
              Preview
            </Link>
          </Button>
          <Button onClick={(e) => handleChange(e, event)}>
            <Send className="size-4" />
            Publier
          </Button>
        </>
      ) : (
        <Button disabled className="bg-green-100 text-green-600">
          <Check className="size-4" />
          Publié
        </Button>
      )}
    </>
  );
}
