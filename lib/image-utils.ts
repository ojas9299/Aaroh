export type UploadMode = "view-once" | "persistent";

export async function uploadImageFile(
  file: File,
  senderId: "meow" | "quack",
  mode: UploadMode,
) {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("senderId", senderId);

  const endpoint =
    mode === "view-once" ? "/api/upload/view-once" : "/api/upload/persistent";

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(payload.error || "Upload failed");
  }

  return response.json();
}

export function validateImage(file: File) {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (!allowed.includes(file.type)) {
    throw new Error("Only jpg, png, webp, and gif images are allowed");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Maximum image size is 5MB");
  }
}

export async function fetchViewOnceImage(
  token: string,
  userId: "meow" | "quack",
) {
  const response = await fetch(
    `/api/image/${token}?userId=${encodeURIComponent(userId)}`,
  );

  if (!response.ok) {
    if (response.status === 410) {
      throw new Error("Image expired");
    }
    if (response.status === 403) {
      throw new Error("Unauthorized");
    }
    throw new Error("Unable to load image");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
