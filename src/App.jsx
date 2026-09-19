import { HashRouter } from 'react-router-dom';
import AppRouter from './router/AppRouter';

/**
 * 应用根组件：路由容器（hash 模式）+ 动态路由渲染入口。
 * 必须 hash 模式：子包以 file:// 加载，无服务器 rewrite，browser 模式会白屏。
 */
export default function App() {
  return (
    <HashRouter>
      <AppRouter />
    </HashRouter>
  );
}
