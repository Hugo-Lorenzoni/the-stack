"use client";

import { Video } from "@prisma/client";
import { useState } from "react";
import { Button } from "./ui/button";

type PropsType = {
  videos: Video[];
};

export default function VideosPagination({ videos }: PropsType) {
  const [currentPage, setCurrentPage] = useState(1);

  const videosPerPage = 6;

  const start = (Number(currentPage) - 1) * Number(videosPerPage); // 0, 5, 10 ...
  const end = start + Number(videosPerPage); // 5, 10, 15 ...
  const results = videos.slice(start, end);

  return (
    <>
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
          {currentPage} / {Math.ceil(videos.length / videosPerPage)}
        </div>

        <Button
          disabled={currentPage >= Math.ceil(videos.length / videosPerPage)}
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
