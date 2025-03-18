import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
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
  return NextResponse.json(
    { code: 0, msg: "", data: { token } },
    { status: 200 }
  );
}
