import minioClient from "@/lib/minio";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } },
) {
  const imageFromS3 = await minioClient
    .getObject("cpv", `${params.path[0]}/${params.path[1]}/${params.path[2]}`)
    .catch((e: any) => {
      console.log("Error while getting object: ", e);
      throw e;
    });
  return new Response(imageFromS3);
}
