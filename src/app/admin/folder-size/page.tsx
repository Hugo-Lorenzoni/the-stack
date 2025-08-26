import {
  getFolderSizeFast,
  getFolderSizeNode,
  getFolderSizeOptimized,
} from "@/lib/folder-size";
import { timedPromise } from "@/utils/getInfos";
import getFolderSize from "get-folder-size";
import { join } from "path";
import { env } from "process";

export default async function folderSizePage() {
  const folderSize = await timedPromise(
    getFolderSize.loose(join(env.DATA_FOLDER, "photos")),
    "folderSize",
  );

  const folderSizeFast = await timedPromise(
    getFolderSizeFast(join(env.DATA_FOLDER, "photos")),
    "folderSizeFast",
  );

  const folderSizeNode = await timedPromise(
    getFolderSizeNode(join(env.DATA_FOLDER, "photos")),
    "folderSizeNode",
  );

  const folderSizeOptimized = await timedPromise(
    getFolderSizeOptimized(join(env.DATA_FOLDER, "photos")),
    "folderSizeOptimized",
  );

  return (
    <div>
      <h1>Folder Size</h1>
      <p>Folder Size (get-folder-size loose): {folderSize} bytes</p>
      <p>Folder Size (custom fast): {folderSizeFast} bytes</p>
      <p>Folder Size (custom node): {folderSizeNode} bytes</p>
      <p>Folder Size (custom optimized): {folderSizeOptimized} bytes</p>
    </div>
  );
}
