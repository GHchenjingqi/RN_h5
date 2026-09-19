import { Suspense, lazy as lazyLoad, useEffect, useMemo } from 'react';
import { Navigate, matchPath, useLocation, useRoutes } from 'react-router-dom';
import BasicLayout from '../layouts/basiclayout/basiclayout';
import NotFound from '../pages/notfound/notfound';
import Loading from '../components/loading/loading';
import { useRouteConfig } from './routeStore';

/**
 * 将一条路由配置归一化为 useRoutes 可消费的路由对象：
 * - redirect  -> <Navigate replace>
 * - component -> 静态组件
 * - lazy      -> React.lazy 懒加载组件（代码分割）
 * - path      -> 嵌套子路由使用相对路径（顶层 '/' 转为 ''）
 * 通用基座不做登录鉴权，故移除 RequireAuth 守卫。
 */
function toRouteObject(route) {
  const { path, component: Component, lazy, redirect, children, ...rest } = route;

  let element;
  if (redirect) {
    element = <Navigate to={redirect} replace />;
  } else if (Component) {
    element = <Component />;
  } else if (lazy) {
    const LazyComp = lazyLoad(lazy);
    element = <LazyComp />;
  }

  return {
    ...rest,
    path: path === '/' ? '' : path.replace(/^\/+/, ''),
    element,
    children: children ? children.map(toRouteObject) : undefined,
  };
}

/** 根据当前 pathname 从配置表（含嵌套）中查找匹配路由（用于取 meta）。 */
function findMatch(pathname, routeList) {
  for (const r of routeList) {
    if (r.path === '*') continue;
    if (matchPath({ path: r.path, end: true }, pathname)) return r;
    if (r.children) {
      const child = findMatch(pathname, r.children);
      if (child) return child;
    }
  }
  return null;
}

/**
 * 应用路由渲染入口：
 * 订阅动态路由表 → 包一层 BasicLayout（含 <Outlet/>）
 * → useRoutes 渲染，并为懒加载页面提供 Suspense 兜底 + 动态更新 document.title。
 */
export default function AppRouter() {
  const routeConfig = useRouteConfig();
  const location = useLocation();

  const fullRoutes = useMemo(
    () => [
      {
        path: '/',
        element: <BasicLayout />,
        children: [...routeConfig.map(toRouteObject), { path: '*', element: <NotFound /> }],
      },
    ],
    [routeConfig],
  );

  const element = useRoutes(fullRoutes, location);

  // 依据当前路由 meta.title 更新文档标题
  useEffect(() => {
    const matched = findMatch(location.pathname, routeConfig);
    if (matched && matched.meta && matched.meta.title) {
      document.title = matched.meta.title;
    }
  }, [location.pathname, routeConfig]);

  return <Suspense fallback={<Loading />}>{element}</Suspense>;
}
