import { readFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 版本真源是 app.config.json（子应用品牌/版本单一来源），构建期注入给 Bridge 握手使用
const appConfig = JSON.parse(readFileSync(new URL('./app.config.json', import.meta.url), 'utf8'));

// base:'./' 是 file:// 加载的关键：产物全部相对路径，禁止绝对根路径
export default defineConfig({
  base: './',
  define: {
    __H5_VERSION__: JSON.stringify(appConfig.versionName || 'dev'),
  },
  // IIFE 单文件输出：
  //  - 产物为外部 js/css 文件（index.html 只写 <script src> 引用，符合规范，不内联）；
  //  - 脚本为普通 <script>（非 type=module），file:// 下无 MIME 检查，可正常加载；
  //  - 单 chunk（无代码分割），与单文件方案体积相当。
  plugins: [react()],
  build: {
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
      },
    },
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    open: false,
  },
});
