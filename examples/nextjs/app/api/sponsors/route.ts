import fs from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";
import { LRUCache } from "lru-cache";

import { SponsorCanvas } from "@/biz/sponsors";
import { StorageDir } from "@/utils/paths";

const CacheMaxAge = Number(process.env.CACHE_TIME) || 100 * 60;
const MaxCacheItems = Number(process.env.MAX_CACHE_ITEMS) || 1024;
const options = {
  max: MaxCacheItems,
  ttl: CacheMaxAge * 1000,
  allowStale: true,
  updateAgeOnGet: false,
  updateAgeOnHas: false,
};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cache = new LRUCache(options);

export async function GET() {
  try {
    const content = fs.readFileSync(
      path.resolve(StorageDir, "config.json"),
      "utf-8"
    );
    const payload = JSON.parse(content);
    const $ins = SponsorCanvas({ width: 800, padding: 32 });
    const r2 = $ins.load(payload);
    return new NextResponse(r2.content, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": `public, max-age=${CacheMaxAge}`,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { code: 101, msg: (error as Error).message, data: null },
      { status: 200 }
    );
  }
}
