import VideosPagination from "@/app/videos/VideosPagination";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { getVideos } from "@/utils/getVideos";
import { SearchX } from "lucide-react";

export default async function VideosPage() {
  const { wideEvent, emit } = await getRequestLogger("/videos");

  let videos: Awaited<ReturnType<typeof getVideos>> = [];

  try {
    videos = await getVideos();
    wideEvent.outcome = "success";
    wideEvent.video_count = videos ? videos.length : 0;
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }

  return (
    <main className="container my-8 min-h-[calc(100vh-10rem)]">
      <h1 className="relative w-fit text-2xl font-semibold after:absolute after:-bottom-1.5 after:left-2 after:h-1 after:w-full after:rounded-full after:bg-orange-600">
        Vidéos
      </h1>
      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {videos.length > 0 ? (
          <VideosPagination videos={videos} />
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
