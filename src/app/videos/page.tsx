import { getVideos } from "@/utils/getVideos";
import { Video } from "@prisma/client";
import { SearchX } from "lucide-react";

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <main className="container min-h-[calc(100vh_-_10rem)] my-8">
      <h1 className="font-semibold text-2xl w-fit relative after:absolute after:bg-orange-600 after:w-full after:h-1 after:-bottom-1.5 after:left-2 after:rounded-full">
        Vidéos
      </h1>
      <section className="grid lg:grid-cols-2 grid-cols-1 mt-8 gap-4">
        {videos ? (
          <>
            {videos.map((video: Video) => (
              <div key={video.id}>
                <h2 className="mb-2 font-semibold">{video.name}</h2>
                <iframe
                  className="w-full aspect-video rounded-2xl"
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
            <SearchX className="w-20 h-20 mt-24 mx-auto" />
            <p className="mt-2 mx-auto w-fit">Aucune vidéo trouvée...</p>
          </>
        )}
      </section>
    </main>
  );
}
