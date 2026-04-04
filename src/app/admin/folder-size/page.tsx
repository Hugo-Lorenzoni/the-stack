import {
  getFolderSizeFast,
  getFolderSizeLibrary,
  getFolderSizeNode,
  getFolderSizeOptimized,
  getFolderSizeStream,
} from "@/lib/folder-size";
import { getRequestLogger } from "@/lib/getRequestLogger";
import { join } from "path";
import { env } from "process";
import { Suspense } from "react";

export default async function folderSizePage() {
  const { wideEvent, emit } = await getRequestLogger("/admin/folder-size");

  const folderPath = join(env.DATA_FOLDER, "photos");

  try {
    // Create individual promises for each method (timing tracked via wideEvent duration_ms)
    const folderSizePromise = timed(getFolderSizeLibrary(folderPath));
    const folderSizeFastPromise = timed(getFolderSizeFast(folderPath));
    const folderSizeNodePromise = timed(getFolderSizeNode(folderPath));
    const folderSizeOptimizedPromise = timed(getFolderSizeOptimized(folderPath));
    const folderSizeStreamPromise = timed(getFolderSizeStream(folderPath));

    wideEvent.outcome = "success";

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
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    wideEvent.outcome = "error";
    wideEvent.error = { message: error.message, type: error.name };
    throw err;
  } finally {
    emit();
  }
}

async function timed<T>(promise: Promise<T>): Promise<[T, number]> {
  const start = Date.now();
  const result = await promise;
  return [result, Date.now() - start];
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
