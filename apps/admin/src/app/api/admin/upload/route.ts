import { getAdmin } from "@decore/auth";
import { MAX_UPLOAD_BYTES, extensionFor, saveUpload } from "@decore/core/uploads";

export async function POST(request: Request) {
  if (!(await getAdmin())) {
    return Response.json({ error: "Sign in again to upload." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Expected a file." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Choose an image." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "That image is larger than 10 MB." }, { status: 413 });
  }

  const extension = extensionFor(file.type);
  if (!extension) {
    return Response.json(
      { error: "Use a JPEG, PNG, WebP or AVIF image." },
      { status: 415 },
    );
  }

  const name = await saveUpload(file, extension);
  return Response.json({ url: `/api/uploads/${name}` });
}
