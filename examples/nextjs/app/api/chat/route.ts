import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: string;
  content: string;
}

interface ChatRequest {
  apiProxyAddress: string;
  apiKey: string;
  messages: ChatMessage[];
  model: string;
  extra: {
    stream: boolean;
    temperature: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const chatReq: ChatRequest = await request.json();

    // 验证必要字段
    if (!chatReq.apiProxyAddress) {
      return NextResponse.json(
        { code: 0, msg: "Missing required fields: apiProxyAddress", data: null },
        { status: 400 }
      );
    }

    // 构建请求体
    const requestBody = {
      messages: chatReq.messages,
      model: chatReq.model,
      stream: chatReq.extra.stream,
      temperature: chatReq.extra.temperature,
    };

    // 调用 LLM API
    const response = await fetch(chatReq.apiProxyAddress, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${chatReq.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    // 检查响应状态
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          code: 0,
          msg: `LLM API error: ${errorText}`,
          data: null,
        },
        { status: response.status }
      );
    }

    // 读取响应
    const llmResponse = await response.json();

    // 返回成功响应
    return NextResponse.json({
      code: 0,
      msg: "success",
      data: llmResponse,
    });
  } catch (error) {
    // 处理错误
    return NextResponse.json(
      {
        code: 0,
        msg: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 }
    );
  }
}
