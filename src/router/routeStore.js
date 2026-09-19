import { useSyncExternalStore } from 'react';
import defaultRoutes from './routes';

/**
 * =====================================================================
 * 动态路由注册中心
 * =====================================================================
 * 以 routes.jsx 的配置表为初始路由表，运行时可通过 API 动态增删路由，
 * 组件用 useRouteConfig() 订阅路由表变化，AppRouter 据此自动重建渲染。
 *
 * 典型场景：
 *   - 登录 / 鉴权后按权限注册业务路由；
 *   - 插件 / 模块热插拔（运行中加载新模块并挂载到对应路径）；
 *   - A/B 实验、灰度下发的新页面。
 *
 * 用法：
 *   import { registerRoute, removeRoute, hasRoute } from './routeStore';
 *   registerRoute({ path: '/admin', name: 'admin', lazy: () => import('../pages/admin/admin') });
 *   removeRoute('admin');   // 按 name 移除
 *   hasRoute('/admin');     // 判断是否存在
 * =====================================================================
 */

// 路由表快照（不可直接改，用下方 API 更新）
let routeList = [...defaultRoutes];

const listeners = new Set();

function emit() {
  listeners.forEach((listener) => listener());
}

/** 订阅路由表变化，返回取消订阅函数。 */
function subscribe(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** 获取当前完整路由表（引用稳定，仅在变化时替换）。 */
function getRoutes() {
  return routeList;
}

function assertValid(route) {
  if (!route || typeof route.path !== 'string' || !route.path) {
    throw new Error('[routeStore] 路由配置缺少有效的 path 字段');
  }
}

/** 判断路由是否存在（按 name 或 path 匹配）。 */
export function hasRoute(identifier) {
  if (!identifier) return false;
  return routeList.some((r) => r.name === identifier || r.path === identifier);
}

/**
 * 注册一条动态路由。
 * @param {object} route    路由配置（同 routes.jsx 字段）
 * @param {object} [options]
 * @param {boolean} [options.prepend] 插入到路由表最前（默认追加到末尾）
 * @throws 路由重复时抛错
 */
export function registerRoute(route, options = {}) {
  assertValid(route);
  if (hasRoute(route.name) || hasRoute(route.path)) {
    throw new Error(`[routeStore] 路由已存在: ${route.name || route.path}`);
  }
  routeList = options.prepend ? [route, ...routeList] : [...routeList, route];
  emit();
  return route;
}

/** 批量注册多条路由。 */
export function registerRoutes(list, options = {}) {
  list.forEach((r) => assertValid(r));
  const added = list.map((r) => ({ ...r }));
  routeList = options.prepend ? [...added, ...routeList] : [...routeList, ...added];
  emit();
  return added;
}

/** 按 name 或 path 移除路由，返回是否移除成功。 */
export function removeRoute(identifier) {
  const next = routeList.filter((r) => r.name !== identifier && r.path !== identifier);
  if (next.length === routeList.length) return false;
  routeList = next;
  emit();
  return true;
}

export { getRoutes };

/**
 * React Hook：订阅路由表。
 * 路由表变化时自动触发使用方重渲染（配合 useRoutes 实现动态路由）。
 */
export function useRouteConfig() {
  return useSyncExternalStore(subscribe, getRoutes);
}
