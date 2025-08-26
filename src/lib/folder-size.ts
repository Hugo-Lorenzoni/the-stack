import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

export async function getFolderSizeOptimized(dir: string): Promise<number> {
  if (os.platform() === "win32") {
    return getFolderSizeWindows(dir);
  } else {
    return getFolderSizeUnix(dir);
  }
}
async function getFolderSizeWindows(dir: string): Promise<number> {
  const { stdout } = await execAsync(
    `powershell -command "& {(Get-ChildItem -Recurse -ErrorAction SilentlyContinue '${dir}' | Measure-Object -Property Length -Sum).Sum}"`,
  );
  return parseInt(stdout.trim(), 10);
}

const execAsync = promisify(exec);

async function getFolderSizeUnix(dir: string): Promise<number> {
  const { stdout } = await execAsync(`du -sb "${dir}"`);
  return parseInt(stdout.split("\t")[0], 10);
}

import { promises as fs } from "fs";
import * as path from "path";

export async function getFolderSizeNode(dir: string): Promise<number> {
  let total = 0;
  const files = await fs.readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const filepath = path.join(dir, file.name);
    if (file.isDirectory()) {
      total += await getFolderSizeNode(filepath);
    } else {
      const stats = await fs.stat(filepath);
      total += stats.size;
    }
  }

  return total;
}

export async function getFolderSizeStream(folderPath: string): Promise<number> {
  let totalSize = 0;
  const queue: string[] = [folderPath];

  while (queue.length > 0) {
    const currentPath = queue.shift()!;
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
      } else if (entry.isDirectory()) {
        queue.push(fullPath);
      }
    }
  }

  return totalSize;
}

export async function getFolderSizeFast(folderPath: string): Promise<number> {
  let totalSize = 0;

  async function calculateSize(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(currentPath, entry.name);

        if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        } else if (entry.isDirectory()) {
          await calculateSize(fullPath);
        }
      }),
    );
  }

  await calculateSize(folderPath);
  return totalSize;
}
