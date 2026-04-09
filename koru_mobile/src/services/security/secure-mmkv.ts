import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import { MMKV } from "react-native-mmkv";


const STORAGE_KEY_ALIAS = "koru.mmkv.master.key";

let appStorage: MMKV | null = null;
let authStorage: MMKV | null = null;
let cacheStorage: MMKV | null = null;


function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}


async function getOrCreateMasterKey() {
  const existing = await SecureStore.getItemAsync(STORAGE_KEY_ALIAS);
  if (existing) {
    return existing;
  }

  const randomBytes = Crypto.getRandomBytes(32);
  const key = bytesToHex(randomBytes);

  await SecureStore.setItemAsync(STORAGE_KEY_ALIAS, key, {
    keychainService: "koru-mmkv-keychain",
  });

  return key;
}


export async function initializeSecureMMKV() {
  if (appStorage && authStorage && cacheStorage) {
    return;
  }

  const encryptionKey = await getOrCreateMasterKey();

  appStorage = new MMKV({
    id: "koru-app-storage",
    encryptionKey,
  });

  authStorage = new MMKV({
    id: "koru-auth-storage",
    encryptionKey,
  });

  cacheStorage = new MMKV({
    id: "koru-cache-storage",
    encryptionKey,
  });
}


function requireStorage(storage: MMKV | null, label: string) {
  if (!storage) {
    throw new Error(`${label} is not initialized yet.`);
  }
  return storage;
}


export function getAppStorage() {
  return requireStorage(appStorage, "appStorage");
}


export function getAuthStorage() {
  return requireStorage(authStorage, "authStorage");
}


export function getCacheStorage() {
  return requireStorage(cacheStorage, "cacheStorage");
}
