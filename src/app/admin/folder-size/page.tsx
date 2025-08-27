import {
  getFolderSizeFast,
  getFolderSizeNode,
  getFolderSizeOptimized,
  getFolderSizeStream,
} from "@/lib/folder-size";
import getFolderSize from "get-folder-size";
import { join } from "path";
import { env } from "process";

async function timedPromise<T>(
  promise: Promise<T>,
  label: string,
): Promise<[T, number]> {
  const start = Date.now();
  const result = await promise;
  const time = Date.now() - start;
  console.log(`[TIMER] ${label} took ${time}ms`);
  return [result, time];
}

export default async function folderSizePage() {
  const [
    folderSize,
    folderSizeFast,
    folderSizeNode,
    folderSizeOptimized,
    folderSizeStream,
  ] = await Promise.all([
    timedPromise(
      getFolderSize.loose(join(env.DATA_FOLDER, "photos")),
      "folderSize",
    ),
    timedPromise(
      getFolderSizeFast(join(env.DATA_FOLDER, "photos")),
      "folderSizeFast",
    ),
    timedPromise(
      getFolderSizeNode(join(env.DATA_FOLDER, "photos")),
      "folderSizeNode",
    ),
    timedPromise(
      getFolderSizeOptimized(join(env.DATA_FOLDER, "photos")),
      "folderSizeOptimized",
    ),
    timedPromise(
      getFolderSizeStream(join(env.DATA_FOLDER, "photos")),
      "folderSizeStream",
    ),
  ]);

  return (
    <div>
      <h1>Folder Size</h1>
      {/* Table */}
      <table className="table-auto border-collapse border border-slate-400">
        <thead>
          <tr>
            <th className="border border-slate-300 px-4 py-2">Method</th>
            <th className="border border-slate-300 px-4 py-2">Size (bytes)</th>
            <th className="border border-slate-300 px-4 py-2">Time (ms)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-slate-300 px-4 py-2">
              get-folder-size
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSize[0]}
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSize[1]}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-2">
              getFolderSizeFast
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeFast[0]}
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeFast[1]}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-2">
              getFolderSizeNode
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeNode[0]}
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeNode[1]}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-2">
              getFolderSizeOptimized
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeOptimized[0]}
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeOptimized[1]}
            </td>
          </tr>
          <tr>
            <td className="border border-slate-300 px-4 py-2">
              getFolderSizeStream
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeStream[0]}
            </td>
            <td className="border border-slate-300 px-4 py-2">
              {folderSizeStream[1]}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
