# Stream Markdown Demo (Next.js + SSE + Streamdown)

一个使用 Server-Sent Events (SSE) 实时推送 Markdown，并在前端通过 Streamdown 组件进行渐进式渲染与完整样式展示的示例项目。支持代码高亮（Shiki）、数学公式（KaTeX）、表格、Mermaid 图表，以及 Tailwind v4 + Typography 的优雅排版与深浅色主题。

## 特性
- 实时流式 Markdown：后端以 ReadableStream + SSE 推送内容，前端随到随渲染。
- 完整样式与高亮：Shiki 代码高亮、KaTeX 公式、GFM 表格与列表、Mermaid 图表渲染。
- Tailwind v4 与 Typography：使用 `prose` 系列类实现精致的排版，支持深浅色主题切换。
- 可配置的分块与节奏：按固定长度拆分 Markdown，并以可调的时间间隔发送，便于测试各类样式。
- 健壮的连接管理：SSE 连接关闭与清理，避免资源泄露。

## 目录结构（关键文件）
- <mcfile name="route.ts" path="src/app/api/stream/route.ts"></mcfile>：SSE 接口与流式发送逻辑
- <mcfile name="StreamMarkdown.tsx" path="src/components/StreamMarkdown.tsx"></mcfile>：前端接收 SSE 并使用 Streamdown 渲染
- <mcfile name="page.tsx" path="src/app/page.tsx"></mcfile>：页面集成
- <mcfile name="globals.css" path="src/app/globals.css"></mcfile>：Tailwind v4、Typography、KaTeX 与主题变量
- next.config.ts / postcss.config.mjs：构建与样式工具配置

## 快速开始
1. 安装依赖
```
npm install
```
2. 本地启动开发服务
```
npm run dev
```
3. 打开浏览器访问
```
http://localhost:3000/
```
您将看到 Markdown 内容以流式方式逐段出现，代码块高亮、表格与公式正常显示，Mermaid 图表在完整内容到达后渲染。

## 运行原理
- 后端（SSE）
  - 在 <mcfile name="route.ts" path="src/app/api/stream/route.ts"></mcfile> 内，<mcsymbol name="GET" filename="route.ts" path="src/app/api/stream/route.ts" startline="5" type="function"></mcsymbol> 使用 `ReadableStream` 按固定长度（默认 120 字符）拆分 `markdown` 字符串并定时推送。
  - 通过 `formatSSEData` 按 SSE 规范格式化：每行以 `data:` 前缀输出，空行分隔事件；连接关闭时清理定时器与控制器。
- 前端（渲染）
  - 在 <mcfile name="StreamMarkdown.tsx" path="src/components/StreamMarkdown.tsx"></mcfile> 中，使用 `EventSource('/api/stream')` 接收流，并将累积文本交给 `<Streamdown />` 渐进式渲染。
  - 应用 `prose prose-neutral dark:prose-invert max-w-none` 类，启用 `shikiTheme={["github-light", "github-dark"]}` 与 `controls`，保留内置的 GFM/Math/Raw 支持。
- 样式与主题
  - <mcfile name="globals.css" path="src/app/globals.css"></mcfile> 引入 Tailwind v4、KaTeX、`@plugin "@tailwindcss/typography"` 与 `@source "../../node_modules/streamdown/dist/index.js"`，并定义浅色/深色主题变量，确保样式不被清理且在两种模式下显示正确。

## 配置与自定义
- 调整流式“节奏”：在 <mcfile name="route.ts" path="src/app/api/stream/route.ts"></mcfile> 修改 `chunkString(markdown, size)` 的 `size`，或调整 `setInterval` 间隔（默认 500ms）。
- 更换内容：直接修改同文件顶部的 `markdown` 变量为你的文本（可包含代码块、表格、公式、Mermaid）。
- 高亮与控件：在 <mcfile name="StreamMarkdown.tsx" path="src/components/StreamMarkdown.tsx"></mcfile> 中调整 `shikiTheme` 或 `controls`（表格/代码/Mermaid 控件开关）。
- Tailwind v4 插件：通过 CSS 内的 `@plugin` 启用，不在 PostCSS 插件数组中添加；确保 `@source` 指向正确路径，避免样式被清理。

## 常见问题
- 样式缺失或不完整：
  - 检查 <mcfile name="globals.css" path="src/app/globals.css"></mcfile> 中的 `@plugin "@tailwindcss/typography"` 与 `@source "../../node_modules/streamdown/dist/index.js"` 是否存在且路径正确。
  - 确认渲染容器使用了 `prose` 类。
- Mermaid 未渲染：
  - 确保图表的完整代码块最终到达（流式传输可能分段），到达后即会渲染。
- 连接/清理问题：
  - SSE 连接关闭会触发清理逻辑；如果你更改推送节奏或内容，确保相应的定时器管理正确。

## 许可证
本示例仅供学习参考，未附带明确许可证。如需商用或二次分发，请根据实际需求添加相应许可文件。