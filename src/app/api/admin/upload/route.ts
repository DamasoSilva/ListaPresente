import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function extensionFor(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Requisição inválida." }, { status: 400 });
  }

  const entries = form.getAll("files");
  if (entries.length === 0) {
    const single = form.get("file");
    if (single) entries.push(single);
  }
  const files = entries.filter(
    (e): e is File => typeof e !== "string"
  );
  if (files.length === 0)
    return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 });

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Tipo não permitido: ${file.type}` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Arquivo muito grande (máx. 5MB)." },
        { status: 400 }
      );
    }
    const ext = extensionFor(file.type);
    const filename = `${randomUUID()}.${ext}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), bytes);
    urls.push(`/uploads/${filename}`);
  }

  return NextResponse.json({ ok: true, urls });
}
