import { readFile } from "node:fs/promises";
import path from "node:path";

import { typeFor, uploadDir } from "@decore/core/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;

  if (!/^[a-zA-Z0-9-]{8,}\.(jpg|jpeg|png|webp|avif)$/.test(name)) {
    return new Response("Not found", { status: 404 });
  }

  const type = typeFor(name);
  if (!type) return new Response("Not found", { status: 404 });

  try {
    const file = await readFile(path.join(uploadDir, name));
    return new Response(new Uint8Array(file), {
      headers: {
        "Content-Type": type,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
