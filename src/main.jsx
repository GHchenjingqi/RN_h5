import React from 'react';
import { createRoot } from 'react-dom/client';

// rem 适配（必须在应用渲染前执行，设置 html 根字体大小）
import './utils/flexible';

// NutUI React 样式
import '@nutui/nutui-react/dist/style.css';
// 全局样式（reset 等）
import './assets/css/main.css';

import App from './App';

// 从基座获取真实状态栏高度，写入 --status-bar-height（异步，不阻塞渲染）
import { applyStatusBarHeight } from './utils/statusBar';
// 启动握手：基座只在收到 app.ready 后才 flush 请求队列，必须在入口发起
import { handshake } from './utils/bridge';

applyStatusBarHeight();
handshake();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
