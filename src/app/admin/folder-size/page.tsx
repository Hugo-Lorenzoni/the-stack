import {
  getFolderSizeFast,
  getFolderSizeNode,
  getFolderSizeOptimized,
  getFolderSizeStream,
} from "@/lib/folder-size";
import getFolderSize from "get-folder-size";
import { join } from "path";
import { env } from "process";
import { Suspense } from "react";

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

export default function folderSizePage() {
  const folderPath = join(env.DATA_FOLDER, "photos");

  // Create individual promises for each method
  const folderSizePromise = timedPromise(
    getFolderSize.loose(folderPath),
    "folderSize",
  );
  const folderSizeFastPromise = timedPromise(
    getFolderSizeFast(folderPath),
    "folderSizeFast",
  );
  const folderSizeNodePromise = timedPromise(
    getFolderSizeNode(folderPath),
    "folderSizeNode",
  );
  const folderSizeOptimizedPromise = timedPromise(
    getFolderSizeOptimized(folderPath),
    "folderSizeOptimized",
  );
  const folderSizeStreamPromise = timedPromise(
    getFolderSizeStream(folderPath),
    "folderSizeStream",
  );

  return (
    <div>
      <h1>Folder Size</h1>
      {/* Table */}
      <table className="table-auto border-collapse border border-slate-400">
        <thead>
          <tr>
            <th className="border border-slate-300 px-4 py-2">Method</th>
            <th className="border border-slate-300 px-4 py-2">Size (Go)</th>
            <th className="border border-slate-300 px-4 py-2">Time (s)</th>
          </tr>
        </thead>
        <tbody>
          <FolderSizeRow
            methodName="get-folder-size"
            promise={folderSizePromise}
          />
          <FolderSizeRow
            methodName="getFolderSizeFast"
            promise={folderSizeFastPromise}
          />
          <FolderSizeRow
            methodName="getFolderSizeNode"
            promise={folderSizeNodePromise}
          />
          <FolderSizeRow
            methodName="getFolderSizeOptimized"
            promise={folderSizeOptimizedPromise}
          />
          <FolderSizeRow
            methodName="getFolderSizeStream"
            promise={folderSizeStreamPromise}
          />
        </tbody>
      </table>
    </div>
  );
}

interface FolderSizeRowProps {
  methodName: string;
  promise: Promise<[number, number]>;
}

async function FolderSizeResult({ promise, methodName }: FolderSizeRowProps) {
  const [size, time] = await promise;

  return (
    <tr>
      <td className="border border-slate-300 px-4 py-2">{methodName}</td>
      <td className="border border-slate-300 px-4 py-2">
        {(size / 1000 / 1000 / 1000).toFixed(2)}
      </td>
      <td className="border border-slate-300 px-4 py-2">
        {(time / 1000).toFixed(2)}
      </td>
    </tr>
  );
}

function LoadingRow({ methodName }: { methodName: string }) {
  return (
    <tr>
      <td className="border border-slate-300 px-4 py-2">{methodName}</td>
      <td className="border border-slate-300 px-4 py-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      </td>
      <td className="border border-slate-300 px-4 py-2">
        <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      </td>
    </tr>
  );
}

function FolderSizeRow({ methodName, promise }: FolderSizeRowProps) {
  return (
    <Suspense fallback={<LoadingRow methodName={methodName} />}>
      <FolderSizeResult promise={promise} methodName={methodName} />
    </Suspense>
  );
}
