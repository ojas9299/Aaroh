// A fixed, named salt string. Both users MUST use the same passphrase AND this
// constant salt to derive the same encryption key. Never change this value once
// messages are stored, or all existing ciphertext becomes permanently unreadable.
const SALT_STRING = "Aaroh_shared_salt_v1";
const SALT = new TextEncoder().encode(SALT_STRING);
const ITERATIONS = 100000;

/**
 * Derives an AES-GCM CryptoKey from a given passphrase.
 */
export async function deriveKey(passphrase: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveBits", "deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Helper to convert ArrayBuffer to Base64 String
 */
function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

/**
 * Helper to convert Base64 String to ArrayBuffer
 */
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypts a plaintext message using AES-GCM.
 * Returns a Base64 string containing [IV (12 bytes) + Ciphertext].
 */
export async function encryptMessage(key: CryptoKey, plaintext: string): Promise<string> {
  const enc = new TextEncoder();
  
  // Generate a random 12-byte IV
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the message
  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(plaintext)
  );

  // Combine IV and Ciphertext into a single buffer
  const combinedBuffer = new Uint8Array(iv.byteLength + ciphertextBuffer.byteLength);
  combinedBuffer.set(iv, 0);
  combinedBuffer.set(new Uint8Array(ciphertextBuffer), iv.byteLength);

  return bufferToBase64(combinedBuffer.buffer);
}

/**
 * Decrypts a Base64 string [IV + Ciphertext] using AES-GCM.
 * Returns the plaintext message.
 */
export async function decryptMessage(key: CryptoKey, base64Ciphertext: string): Promise<string> {
  const combinedBuffer = base64ToBuffer(base64Ciphertext);
  
  // Extract the first 12 bytes as the IV, the rest is ciphertext
  const iv = combinedBuffer.slice(0, 12);
  const ciphertextBuffer = combinedBuffer.slice(12);

  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertextBuffer
  );

  const dec = new TextDecoder();
  return dec.decode(decryptedBuffer);
}
