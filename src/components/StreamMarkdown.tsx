"use client";
import { useEffect, useRef, useState } from "react";
import { Streamdown } from "streamdown";

export default function StreamMarkdown() {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "connecting" | "open" | "closed" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    setStatus("connecting");
    const es = new EventSource("/api/stream");
    eventSourceRef.current = es;

    es.onopen = () => setStatus("open");

    es.onmessage = (e) => {
      // 累积 Markdown 内容
      setContent((prev) => prev + e.data);
    };

    es.addEventListener("end", () => {
      es.close();
      setStatus("closed");
    });

    es.onerror = (e) => {
      setError("连接发生错误，稍后重试。");
      setStatus("error");
      try { es.close(); } catch {}
    };

    return () => {
      es.close();
    };
  }, []);

  return (
    <div className="w-[800px]">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
        <span>状态：{status}</span>
        {error && <span className="text-red-500">错误：{error}</span>}
      </div>
      <div className="my-3 flex gap-2">
        <button
          className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setContent("")}
        >
          清空内容
        </button>
        <button
          className="px-3 py-1 rounded border hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => {
            if (status === "closed" || status === "error") {
              setError(null);
              setStatus("connecting");
              const es = new EventSource("/api/stream");
              eventSourceRef.current = es;
              es.onopen = () => setStatus("open");
              es.onmessage = (e) => setContent((prev) => prev + e.data);
              es.addEventListener("end", () => { es.close(); setStatus("closed"); });
              es.onerror = () => { setError("连接发生错误，稍后重试。"); setStatus("error"); try { es.close(); } catch {} };
            }
          }}
        >
          重新连接
        </button>
      </div>
      <div className="rounded-lg border p-4 bg-white/60 dark:bg-black/40">
        <Streamdown
          components={{}}
          controls
          shikiTheme={["github-light", "github-dark"]}
          className="prose prose-neutral dark:prose-invert max-w-none"
        >
          {content}
        </Streamdown>
      </div>
    </div>
  );
}