import fs from "node:fs";
import path from "node:path";

import { NextRequest, NextResponse } from "next/server";

import { StorageDir } from "@/utils/paths";

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization");

  if (!token) {
    return NextResponse.json(
      { code: 900, msg: "缺少 token", data: null },
      { status: 200 }
    );
  }
  if (token !== process.env.TOKEN) {
    return NextResponse.json(
      { code: 900, msg: "token 错误", data: null },
      { status: 200 }
    );
  }

  try {
    const content = fs.readFileSync(
      path.resolve(StorageDir, "config.json"),
      "utf-8"
    );
    const json = JSON.parse(content);
    return NextResponse.json({ code: 0, msg: "", data: json }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { code: 101, msg: (error as Error).message, data: null },
      { status: 200 }
    );
  }
}
