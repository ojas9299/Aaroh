import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

type Params = {
  params: {
    path: string[];
  };
};

function contentTypeFromFileName(fileName: string) {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "application/octet-stream";
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId !== "meow" && userId !== "quack") {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    const relativePath = params.path.join("/");
    if (!relativePath.startsWith("images/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const imageUrl = `/uploads/${relativePath}`;

    const client = await clientPromise;
    const db = client.db("Aaroh");

    const imageMessage = await db.collection("messages").findOne({
      type: "image",
      mode: "persistent",
      imageUrl,
      $or: [{ senderId: userId }, { receiverId: userId }, { sender: userId }],
    });

    if (!imageMessage) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const absolutePath = path.join(process.cwd(), "uploads", relativePath);
    const bytes = await fs.readFile(absolutePath);

    return new NextResponse(new Uint8Array(bytes), {
      status: 200,
      headers: {
        "Content-Type": contentTypeFromFileName(relativePath),
        "Cache-Control": "private, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
