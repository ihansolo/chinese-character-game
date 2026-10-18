import { localStorageAdapter } from "./storage/localStorageAdapter";
import { ttsAdapter } from "./audio/ttsAdapter";

/** Single seam to swap the storage/audio backends later (e.g. for Capacitor or recorded audio). */
export const storage = localStorageAdapter;
export const audio = ttsAdapter;
