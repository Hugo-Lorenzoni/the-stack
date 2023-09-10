import { getVideos } from "@/utils/getVideos";
import { DataTable } from "./data-table";
import { columns } from "./columns";

export default async function VideosManagementPage() {
  const videos = await getVideos();
  return (
    <section>
      <h2 className="pb-4">Videos Management Page</h2>
      <DataTable columns={columns} data={videos} />
    </section>
  );
}
