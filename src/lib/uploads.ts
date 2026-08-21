import { unlink } from "fs/promises";
import path from "path";

export function isLocalUpload(url?: string | null): boolean {
  return !!url && url.startsWith("/uploads/");
}

export async function deleteLocalFiles(urls: string[]): Promise<void> {
  await Promise.all(
    urls
      .filter(isLocalUpload)
      .map(async (u) => {
        try {
          await unlink(path.join(process.cwd(), "public", u));
        } catch {
          // ignore missing files
        }
      })
  );
}
