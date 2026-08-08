/**
 * PIN hashing for the app lock.
 *
 * Uses PBKDF2 (SHA-256, 150k iterations) with a per-user random salt, via Web
 * Crypto — available both in the browser and in the Cloudflare Worker runtime.
 *
 * Scope note: this gates *viewing* the app on a device that's already signed
 * in. The account itself is protected by your password and by database-level
 * row security; a short PIN is not, and can't be, a substitute for either.
 */

// Cloudflare Workers refuses PBKDF2 iteration counts above 100,000, so this is
// the ceiling rather than a preference. Don't raise it without checking the
// runtime still accepts it — Node does, Workers doesn't.
const ITERATIONS = 100_000;
const KEY_BITS = 256;

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toHex(bytes.buffer);
}

export async function hashPin(pin: string, saltHex: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: fromHex(saltHex),
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    key,
    KEY_BITS,
  );
  return toHex(bits);
}

/** Constant-time-ish comparison, so timing doesn't leak how much matched. */
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export async function verifyPin(
  pin: string,
  saltHex: string,
  expectedHash: string,
): Promise<boolean> {
  const actual = await hashPin(pin, saltHex);
  return safeEqual(actual, expectedHash);
}

/**
 * Why a PIN was rejected.
 *
 * A code rather than a sentence: this module is imported by the Worker as well
 * as the browser and has no access to the translator, so it says *what* is
 * wrong and leaves the wording to whoever is rendering it.
 */
export type PinProblem = "length" | "repetitive" | "common";

export type PinCheck = { ok: true } | { ok: false; reason: PinProblem };

/** A PIN must be 4–8 digits, and not one of the obvious ones. */
export function validatePin(pin: string): PinCheck {
  if (!/^\d{4,8}$/.test(pin)) return { ok: false, reason: "length" };
  if (/^(\d)\1+$/.test(pin)) return { ok: false, reason: "repetitive" };
  if (pin === "1234" || pin === "12345" || pin === "0000") {
    return { ok: false, reason: "common" };
  }
  return { ok: true };
}

const PIN_PROBLEM_KEYS: Record<PinProblem, string> = {
  length: "lock.pinLength",
  repetitive: "lock.pinRepetitive",
  common: "lock.pinCommon",
};

/** The dictionary key for a problem, so the caller can run it through `t()`. */
export function pinProblemKey(reason: PinProblem): string {
  return PIN_PROBLEM_KEYS[reason];
}

/**
 * The server rejects a bad PIN too, as a guard against anything that skips the
 * form. It can't translate the reason, so it sends this code and the browser
 * turns it back into a sentence in the reader's language.
 */
const PIN_PROBLEM_PREFIX = "pin_problem:";

export function pinProblemCode(reason: PinProblem): string {
  return `${PIN_PROBLEM_PREFIX}${reason}`;
}

/** Reads a code back out of an error message, or null if it isn't one. */
export function readPinProblem(message: string): PinProblem | null {
  if (!message.startsWith(PIN_PROBLEM_PREFIX)) return null;
  const reason = message.slice(PIN_PROBLEM_PREFIX.length);
  return reason in PIN_PROBLEM_KEYS ? (reason as PinProblem) : null;
}
