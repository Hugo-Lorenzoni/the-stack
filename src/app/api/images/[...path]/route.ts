import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } },
) {
  const filePath = path.resolve(
    ".",
    `public/${params.path[0]}/${params.path[1]}/${params.path[2]}`,
  );
  const imageBuffer = fs.readFileSync(filePath);
  return new Response(imageBuffer);
}
