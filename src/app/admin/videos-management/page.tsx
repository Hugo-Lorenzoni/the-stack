import { getVideos } from "@/utils/getVideos";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function VideosManagementPage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/videos-management");

  let videos: Awaited<ReturnType<typeof getVideos>> = [];

  try {
    videos = await getVideos();
    wideEvent.outcome = "success";
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }

  return (
    <section>
      <h2 className="pb-4">Videos Management Page</h2>
      <DataTable columns={columns} data={videos} />
    </section>
  );
}
