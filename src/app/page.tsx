import StreamMarkdown from "@/components/StreamMarkdown";

export default function Home() {
  return (
    <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
      {/* 流式 Markdown 渲染区块 */}
      <section className="w-full mt-6">
        <h2 className="text-xl font-semibold mb-2">前后端 SSE 流式渲染 Markdown 演示</h2>
        <StreamMarkdown />
      </section>
    </main>
  );
}
