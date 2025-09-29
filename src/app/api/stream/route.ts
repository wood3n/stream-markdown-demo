import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const markdown = `# AI Models Overview

Modern AI models have revolutionized how we interact with technology. From **language models** to _computer vision_, these systems demonstrate remarkable capabilities.

## Key Features

### Benefits
- Natural language understanding
- Multi-modal processing
- Real-time inference

### Requirements
1. GPU acceleration
2. Model weights
3. API access

## Architecture

![Model Architecture](https://placehold.co/600x400)

## Insights

> "The development of full artificial intelligence could spell the end of the human race." — Stephen Hawking

Learn more about [AI safety](https://example.com) and \`transformer\` architectures.
`;

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  const chunkString = (str: string, size: number) => {
    const chunks: string[] = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  };
  const formatSSEData = (text: string) =>
    text.split("\n").map((line) => `data: ${line}`).join("\n") + "\n\n";

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const mdChunks = markdown.split(" ").map((token) => `${token} `)

      let i = 0;
      const interval = setInterval(() => {
        if (i >= mdChunks.length) {
          controller.enqueue(encoder.encode("event: end\ndata: [DONE]\n\n"));
          clearInterval(interval);
          controller.close();
          return;
        }
        const chunk = mdChunks[i++];
        controller.enqueue(encoder.encode(formatSSEData(chunk)));
      }, 100);

      // 连接被取消时清理资源
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
    cancel() {},
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}