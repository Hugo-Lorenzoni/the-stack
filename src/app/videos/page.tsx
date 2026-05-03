import VideosPagination from "@/app/videos/VideosPagination";
import { getVideos } from "@/utils/getVideos";
import { Search } from "lucide-react";

export default async function VideosPage() {
  const videos = await getVideos();

  return (
    <main className="container my-8 flex min-h-[calc(100vh-10rem)] flex-col">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Vidéos
      </h1>
      {videos.length > 0 ? (
        <VideosPagination videos={videos} />
      ) : (
        <div className="text-muted-foreground flex flex-1 items-center justify-center gap-4 text-center">
          <Search className="size-10" />
          <p className="text-lg font-semibold">
            Il n&apos;y a pas encore de vidéos disponibles...
          </p>
        </div>
      )}
    </main>
  );
}
