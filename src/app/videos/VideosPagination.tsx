"use client";

import { Video } from "@prisma/client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PropsType = {
  videos: Video[];
};

const VIDEOS_PER_PAGE = 6;

export default function VideosPagination({ videos }: PropsType) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState("");

  const filteredVideos = videos.filter((video) =>
    video.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(
        searchField
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
      ),
  );

  const start = (Number(currentPage) - 1) * Number(VIDEOS_PER_PAGE); // 0, 5, 10 ...
  const end = start + Number(VIDEOS_PER_PAGE); // 5, 10, 15 ...
  const results = filteredVideos.slice(start, end);

  return (
    <>
      <div className="relative mt-8 max-w-md">
        <Input
          className="pr-12"
          onChange={(e) => (setSearchField(e.target.value), setCurrentPage(1))}
          placeholder="Search"
        />
        <div className="pointer-events-none absolute top-0 right-0 bottom-0 flex items-center rounded-lg px-4">
          <Search className="h-4 w-4" />
        </div>
      </div>
      {results.length > 0 ? (
        <div className="mt-8 grid flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
          {results.map((video) => (
            <div key={video.id}>
              <h2 className="mb-2 font-semibold">{video.name}</h2>
              <iframe
                className="aspect-video w-full rounded-2xl"
                src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                title={video.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-muted-foreground flex flex-1 items-center justify-center gap-4 text-center">
          <Search className="size-10" />
          <p className="text-lg font-semibold">
            Aucune vidéo ne correspond à votre recherche...
          </p>
        </div>
      )}
      {filteredVideos.length > VIDEOS_PER_PAGE ? (
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button
            disabled={currentPage == 1}
            onClick={() => setCurrentPage((page) => page - 1)}
          >
            Précédent
          </Button>

          <div>
            {currentPage} / {Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE)}
          </div>

          <Button
            disabled={
              currentPage >= Math.ceil(filteredVideos.length / VIDEOS_PER_PAGE)
            }
            onClick={() => {
              setCurrentPage((page) => page + 1);
            }}
          >
            Suivant
          </Button>
        </div>
      ) : null}
    </>
  );
}
