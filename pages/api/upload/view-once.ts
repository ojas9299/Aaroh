import type { NextApiRequest, NextApiResponse } from "next";
import { v4 as uuidv4 } from "uuid";
import { uploadMemory } from "@/lib/upload-config";
import { runMiddleware } from "@/lib/run-middleware";
import {
  setViewOnceImage,
  startImageStoreCleanup,
  getViewOnceTtlMs,
} from "@/lib/image-store";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadResponse = {
  type: "image";
  mode: "view-once";
  token: string;
  ttlMs: number;
};

type MulterRequest = NextApiRequest & {
  file?: {
    buffer: Buffer;
    mimetype: string;
  };
};

function getReceiver(senderId: "meow" | "quack") {
  return senderId === "meow" ? "quack" : "meow";
}

export default async function handler(
  req: MulterRequest,
  res: NextApiResponse<UploadResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  startImageStoreCleanup();

  try {
    await runMiddleware(req, res, uploadMemory.single("image"));

    const senderId = req.body?.senderId;

    if (senderId !== "meow" && senderId !== "quack") {
      return res.status(400).json({ error: "Invalid senderId" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const token = uuidv4();

    setViewOnceImage(token, {
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      senderId,
      receiverId: getReceiver(senderId),
    });

    return res.status(200).json({
      type: "image",
      mode: "view-once",
      token,
      ttlMs: getViewOnceTtlMs(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return res.status(400).json({ error: message });
  }
}
