"use client";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components//ui/button";
import { Event } from "@/app/admin/drafted-events/columns";
import { Check, Send } from "lucide-react";

export default function RowActions(props: { row: Row<Event> }) {
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(props.row.original);

  async function handleChange(
    e: React.MouseEvent<HTMLButtonElement>,
    event: Event
  ) {
    e.preventDefault();
    try {
      const apiUrlEndpoint = "http://localhost:3000/api/admin/publishevent";
      const postData = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      };
      const response = await fetch(apiUrlEndpoint, postData);
      console.log(response);
      const published = await response.json();
      console.log(published);

      if (response.status == 500) {
        toast({
          variant: "destructive",
          title: response.status.toString(),
          description: response.statusText,
        });
      }
      if (response.status == 200 && published) {
        toast({
          variant: "default",
          title: "Publication réussie",
          description: `L'événement ${event.title} est maintenant publié`,
        });
        setEvent(null);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      {event ? (
        <Button onClick={(e) => handleChange(e, event)}>
          <Send className="w-4 h-4 mr-2" />
          Publier
        </Button>
      ) : (
        <Button disabled className="bg-green-100 text-green-600">
          <Check className="w-4 h-4 mr-2" />
          Publié
        </Button>
      )}
    </>
  );
}