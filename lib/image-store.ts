type ViewOnceImageRecord = {
  buffer: Buffer;
  mimeType: string;
  expiresAt: number;
  senderId: "meow" | "quack";
  receiverId: "meow" | "quack";
};

const TTL_MS = 3 * 60 * 1000;
const CLEANUP_EVERY_MS = 30 * 1000;

export const imageStore = new Map<string, ViewOnceImageRecord>();

let cleanupStarted = false;

export function getViewOnceTtlMs() {
  return TTL_MS;
}

export function setViewOnceImage(
  token: string,
  payload: Omit<ViewOnceImageRecord, "expiresAt">,
) {
  imageStore.set(token, {
    ...payload,
    expiresAt: Date.now() + TTL_MS,
  });
}

export function getViewOnceImage(token: string) {
  const record = imageStore.get(token);
  if (!record) return null;

  if (record.expiresAt <= Date.now()) {
    imageStore.delete(token);
    return null;
  }

  return record;
}

export function consumeViewOnceImage(token: string) {
  const record = getViewOnceImage(token);
  if (!record) return null;

  imageStore.delete(token);
  return record;
}

export function startImageStoreCleanup() {
  if (cleanupStarted) return;
  cleanupStarted = true;

  setInterval(() => {
    const now = Date.now();
    imageStore.forEach((record, token) => {
      if (record.expiresAt <= now) {
        imageStore.delete(token);
      }
    });
  }, CLEANUP_EVERY_MS);
}
