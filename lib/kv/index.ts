/**
 * Key-Value Store Abstraction
 *
 * Uses Upstash Redis (Vercel KV) when configured, falls back to
 * in-memory storage when KV_REST_API_URL is not set.
 *
 * To enable persistent storage:
 * 1. Create a KV store in Vercel Dashboard → Storage → Create → KV
 * 2. Connect it to your project (auto-sets env vars)
 * 3. Required env vars: KV_REST_API_URL, KV_REST_API_TOKEN
 *
 * Works identically for BLC and Otyokwah — each project gets its
 * own KV store with its own env vars.
 */

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

// Support custom prefix (e.g., BLCKV_ for BLC, OTYKV_ for Otyokwah)
function getKvCredentials(): { url: string; token: string } | null {
  const url =
    process.env.KV_REST_API_URL ||
    process.env.BLCKV_KV_REST_API_URL ||
    process.env.OTYKV_KV_REST_API_URL;
  const token =
    process.env.KV_REST_API_TOKEN ||
    process.env.BLCKV_KV_REST_API_TOKEN ||
    process.env.OTYKV_KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function getRedis(): Redis | null {
  if (redis) return redis;
  const creds = getKvCredentials();
  // Intentionally NOT cached when env vars are absent — `redis` stays null so
  // the next call re-checks env vars (they may appear at runtime after build).
  if (!creds) return null;
  redis = new Redis(creds);
  return redis;
}

// In-memory fallback
const memStore = new Map<string, unknown>();

export async function kvGet<T>(key: string): Promise<T | null> {
  const kv = getRedis();
  if (kv) {
    try {
      return await kv.get<T>(key);
    } catch {
      return null;
    }
  }
  return (memStore.get(key) as T) ?? null;
}

export async function kvSet(
  key: string,
  value: unknown,
  ttlSeconds?: number,
): Promise<void> {
  const kv = getRedis();
  if (kv) {
    try {
      if (ttlSeconds) {
        await kv.set(key, value, { ex: ttlSeconds });
      } else {
        await kv.set(key, value);
      }
      return;
    } catch {
      // Fall through to memory
    }
  }
  memStore.set(key, value);
}

export async function kvLpush(key: string, value: unknown): Promise<void> {
  const kv = getRedis();
  if (kv) {
    try {
      await kv.lpush(key, value);
      return;
    } catch {
      // Fall through to memory
    }
  }
  const list = (memStore.get(key) as unknown[]) || [];
  list.unshift(value);
  memStore.set(key, list);
}

export async function kvLrange<T>(
  key: string,
  start: number,
  stop: number,
): Promise<T[]> {
  const kv = getRedis();
  if (kv) {
    try {
      return await kv.lrange<T>(key, start, stop);
    } catch {
      return [];
    }
  }
  const list = (memStore.get(key) as T[]) || [];
  const end = stop === -1 ? list.length : stop + 1;
  return list.slice(start, end);
}

export async function kvLtrim(
  key: string,
  start: number,
  stop: number,
): Promise<void> {
  const kv = getRedis();
  if (kv) {
    try {
      await kv.ltrim(key, start, stop);
      return;
    } catch {
      // Fall through to memory
    }
  }
  const list = (memStore.get(key) as unknown[]) || [];
  const end = stop === -1 ? list.length : stop + 1;
  memStore.set(key, list.slice(start, end));
}

export async function kvLlen(key: string): Promise<number> {
  const kv = getRedis();
  if (kv) {
    try {
      return await kv.llen(key);
    } catch {
      return 0;
    }
  }
  return ((memStore.get(key) as unknown[]) || []).length;
}

export function isKvConfigured(): boolean {
  return getKvCredentials() !== null;
}
