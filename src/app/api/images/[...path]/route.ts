import fs from "fs";
import path from "path";
import { env } from "process";

export async function GET(
  request: Request,
  props: { params: Promise<{ path: string[] }> },
) {
  const params = await props.params;
  const filePath = path.join(
    env.DATA_FOLDER,
    "photos",
    params.path[0],
    params.path[1],
    params.path[2],
  );
  const imageBuffer = fs.readFileSync(filePath);
  return new Response(imageBuffer);
}
