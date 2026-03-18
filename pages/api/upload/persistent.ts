import type { NextApiRequest, NextApiResponse } from "next";
import { put } from "@vercel/blob";
import { uploadMemory } from "@/lib/upload-config";
import { runMiddleware } from "@/lib/run-middleware";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadResponse = {
  type: "image";
  mode: "persistent";
  imageUrl: string;
};

type MulterRequest = NextApiRequest & {
  file?: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  };
};

export default async function handler(
  req: MulterRequest,
  res: NextApiResponse<UploadResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Use memory storage for the initial upload buffer
    await runMiddleware(req, res, uploadMemory.single("image"));

    const senderId = req.body?.senderId;
    if (senderId !== "meow" && senderId !== "quack") {
      return res.status(400).json({ error: "Invalid senderId" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    // Upload to Vercel Blob
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const blob = await put(filename, req.file.buffer, {
      access: 'public',
      contentType: req.file.mimetype,
    });

    return res.status(200).json({
      type: "image",
      mode: "persistent",
      imageUrl: blob.url,
    });
  } catch (error) {
    console.error("Vercel Blob upload error:", error);
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
