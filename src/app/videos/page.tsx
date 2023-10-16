import { getVideos } from "@/utils/getVideos";
import { Video } from "@prisma/client";
import { SearchX } from "lucide-react";

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <main className="container my-8 min-h-[calc(100vh_-_10rem)]">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Vidéos
      </h1>
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {videos ? (
          <>
            {videos.map((video: Video) => (
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
          </>
        ) : (
          <>
            <SearchX className="mx-auto mt-24 h-20 w-20" />
            <p className="mx-auto mt-2 w-fit">Aucune vidéo trouvée...</p>
          </>
        )}
      </section>
    </main>
  );
}
