// Ensure Web Crypto is available in Node/Jest environments.
// Some CI runners expose Node crypto but not globalThis.crypto by default.
import { webcrypto } from "crypto";

if (!(globalThis as any).crypto) {
  (globalThis as any).crypto = webcrypto;
}
