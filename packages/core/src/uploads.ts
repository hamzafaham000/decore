import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Local image storage. Files live outside `public` so they survive a rebuild,
 * and are served by /api/uploads/[name].
 *
 * The storefront and the dashboard are separate apps, so point both at the
 * same folder with UPLOAD_DIR. On one machine that is the repo's data/uploads;
 * with two hosts it has to be a shared volume or, better, object storage.
 *
 * This is right for a machine or a server with a disk. Before deploying to a
 * read-only host such as Vercel, swap `saveUpload` for object storage (Blob,
 * S3 or R2) — the rest of the dashboard already stores plain URLs.
 */
const configured = process.env.UPLOAD_DIR;

/**
 * `turbopackIgnore` keeps the bundler from tracing the whole project: the
 * folder is read at runtime, and without this the build treats `process.cwd()`
 * as an input, pulling every source file into the server output. That bloats
 * the deploy and can hit size limits on hosts like Vercel.
 */
export const uploadDir = configured
  ? path.resolve(/* turbopackIgnore: true */ process.cwd(), configured)
  : path.join(process.cwd(), "data", "uploads");

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

const typesByExtension: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export function extensionFor(mime: string): string | undefined {
  return extensions[mime.toLowerCase()];
}

export function typeFor(name: string): string | undefined {
  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? typesByExtension[extension] : undefined;
}

export async function saveUpload(file: File, extension: string) {
  await mkdir(uploadDir, { recursive: true });

  const name = `${randomUUID()}.${extension}`;
  const bytes = new Uint8Array(await file.arrayBuffer());
  await writeFile(path.join(/* turbopackIgnore: true */ uploadDir, name), bytes);

  return name;
}
