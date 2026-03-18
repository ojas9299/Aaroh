import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import { consumeViewOnceImage } from "@/lib/image-store";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = req.query.token;
  const userId = req.query.userId;

  if (typeof token !== "string") {
    return res.status(400).json({ error: "Invalid token" });
  }

  if (userId !== "meow" && userId !== "quack") {
    return res.status(400).json({ error: "Invalid userId" });
  }

  const image = consumeViewOnceImage(token);

  if (!image) {
    return res.status(410).json({ error: "Image not found or expired" });
  }

  if (image.senderId !== userId && image.receiverId !== userId) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("Aaroh");

    await db
      .collection("messages")
      .updateOne(
        { type: "image", mode: "view-once", token },
        { $set: { viewed: true, viewedAt: Date.now() } },
      );
  } catch (error) {
    console.error("Failed updating view-once message state:", error);
  }

  res.setHeader("Content-Type", image.mimeType);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).send(image.buffer);
}
