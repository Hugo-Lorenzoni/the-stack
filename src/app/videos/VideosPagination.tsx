"use client";

import { Video } from "@prisma/client";
import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search } from "lucide-react";

type PropsType = {
  videos: Video[];
};

export default function VideosPagination({ videos }: PropsType) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchField, setSearchField] = useState("");

  const videosPerPage = 6;

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

  const start = (Number(currentPage) - 1) * Number(videosPerPage); // 0, 5, 10 ...
  const end = start + Number(videosPerPage); // 5, 10, 15 ...
  const results = filteredVideos.slice(start, end);

  return (
    <>
      <div className="relative max-w-md lg:col-span-2">
        <Input
          className="pr-12"
          onChange={(e) => (setSearchField(e.target.value), setCurrentPage(1))}
          placeholder="Search"
        />
        <div className="pointer-events-none absolute bottom-0 right-0 top-0 flex items-center rounded-lg px-4">
          <Search className="h-4 w-4" />
        </div>
      </div>
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
      <div className="mt-4 flex items-center justify-between gap-2 lg:col-span-2">
        <Button
          disabled={currentPage == 1}
          onClick={() => setCurrentPage((page) => page - 1)}
        >
          Précédent
        </Button>

        <div>
          {currentPage} / {Math.ceil(filteredVideos.length / videosPerPage)}
        </div>

        <Button
          disabled={
            currentPage >= Math.ceil(filteredVideos.length / videosPerPage)
          }
          onClick={() => {
            setCurrentPage((page) => page + 1);
          }}
        >
          Suivant
        </Button>
      </div>
    </>
  );
}
