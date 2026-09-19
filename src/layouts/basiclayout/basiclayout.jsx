import { Suspense, useMemo } from 'react';
import { matchPath, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Tabbar, TabbarItem } from '@nutui/nutui-react';
import QNavbar from '../../components/qnavbar/qnavbar';
import Loading from '../../components/loading/loading';
import { useRouteConfig } from '../../router/routeStore';
import { TABS } from './tabs';
import './basiclayout.css';

/**
 * 底部 Tab 图标（内联 SVG，按选中态着色）。
 */
function TabIcon({ name, active }) {
  const color = active ? 'var(--main-color)' : '#7d7e80';
  const props = {
    width: '0.22rem',
    height: '0.22rem',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  if (name === 'home') {
    return (
      <svg {...props}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20h14V9.5" />
      </svg>
    );
  }
  if (name === 'debug') {
    return (
      <svg {...props}>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 9h8M8 13h8M8 17h4" />
      </svg>
    );
  }
  if (name === 'about') {
    return (
      <svg {...props}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    );
  }
  return null;
}

/**
 * 基础布局（通用基座框架）：
 * - 顶部导航栏 QNavbar：标题取自路由 meta.title；Tab 根页面不显示返回箭头；
 *   meta.hideNavbar 时整条不渲染（页面自绘顶部，需自行避让状态栏）。
 * - 内容区 Outlet（懒加载页用 Suspense 兜底）；main 为滚动容器。
 * - 底部标签栏 Tabbar：首页 / 能力测试 / 关于；meta.hideTabbar 时隐藏。
 */
export default function BasicLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeConfig = useRouteConfig();

  const matched = useMemo(
    () => routeConfig.find((r) => matchPath({ path: r.path, end: true }, location.pathname)) || null,
    [routeConfig, location.pathname],
  );
  const meta = matched?.meta || {};
  const hideNavbar = meta.hideNavbar === true;
  const hideTabbar = meta.hideTabbar === true;
  const isTabRoot = TABS.some((t) => matchPath({ path: t.path, end: true }, location.pathname));
  const activeIndex = TABS.findIndex((t) => matchPath({ path: t.path, end: true }, location.pathname));

  return (
    <div className="basic-layout">
      {!hideNavbar && (
        <QNavbar title={meta.title || '基座'} fixed showBack={!isTabRoot} onBack={() => navigate(-1)} />
      )}
      <main className={`basic-layout__main ${hideTabbar ? 'basic-layout__main--no-tabbar' : ''}`}>
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </main>
      {!hideTabbar && (
        <Tabbar
          fixed
          safeArea
          className="basic-layout__tabbar"
          value={activeIndex >= 0 ? activeIndex : 0}
          activeColor="var(--main-color)"
          inactiveColor="#7d7e80"
          onSwitch={(i) => navigate(TABS[i].path)}
        >
          {TABS.map((t) => (
            <TabbarItem
              key={t.path}
              title={t.title}
              icon={(active) => <TabIcon name={t.icon} active={active} />}
            />
          ))}
        </Tabbar>
      )}
    </div>
  );
}
