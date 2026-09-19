/**
 * QNavbar：基于 NutUI NavBar 的页面顶部导航栏二次封装。
 *
 * 支持两类背景：
 *   1. transparent —— 透明背景，叠在页面渐变/插画背景上（如消息中心、产品中心）；
 *      配合 fixed 使用时，下滑背景逐渐变白，回到顶部恢复透明（滚动渐变导航栏）。
 *   2. backgroundColor —— 颜色背景（默认白底，可传任意颜色），如修改密码页白底导航。
 *
 * 背景 / 高度 / 标题颜色通过覆盖 NutUI CSS 变量实现：
 *   --nutui-navbar-background       背景色
 *   --nutui-navbar-height           高度（固定 rem 单位，遵守项目 rem 规范）
 *   --nutui-navbar-title-font-color 标题颜色
 *
 * 滚动渐变（transparent + fixed 时自动启用）：
 *   - 下滑时背景从透明 → 白色，阈值由 scrollThreshold 控制（默认 80px）
 *   - 回到顶部恢复透明
 *   - 直接操作 CSS 变量，不触发 React 重渲染；requestAnimationFrame 节流
 *
 * 返回按钮点击自动记录 RN.LOG.INFO 埋点（event='button_click', button='nav_back'），
 * 参数对齐基座 LogParams 规范（event/page/button/fn/data）。
 *
 * 用法：
 *   {/* 颜色背景 *\/}
 *   <QNavbar title="修改密码" onBack={() => navigate(-1)} />
 *
 *   {/* 透明背景 + fixed，下滑自动渐变变白 *\/}
 *   <QNavbar title="消息详情" transparent fixed onBack={() => navigate(-1)} />
 *
 *   {/* 透明背景，深色图上配白字 *\/}
 *   <QNavbar title="产品中心" transparent color="#fff" />
 *
 *   {/* 带右侧操作区 *\/}
 *   <QNavbar title="设置" right={<span>保存</span>} />
 */
import { useEffect, useRef } from 'react';
import { NavBar } from '@nutui/nutui-react';
import { useNavigate } from 'react-router-dom';
import { getPlatform } from '../../utils/commonfun';

/**
 * 导航栏固定高度（Android 56px / iOS 44px）。
 * 说明：导航栏/状态栏属于系统级固定控件，高度不随屏幕宽度缩放；
 *       若用 rem（随视口等比缩放）会导致不同宽度设备上导航栏高度不一致，
 *       在窄屏 Android 真机上显得只比状态栏高一点。
 * 标准：Android 56px（Material AppBar/Toolbar）、iOS 44px（Apple HIG）。
 * 此为项目 rem 规范中固定控件的合理例外。
 */
export const NAVBAR_HEIGHT = `${getPlatform() === 'android' ? 56 : 44}px`;

/** 获取当前页面路径（hash 路由下取 hash 部分，如 #/login → /login）。 */
function getCurrentPage() {
  try {
    if (window.location.hash) {
      return window.location.hash.replace(/^#/, '') || '/';
    }
    return window.location.pathname || '/';
  } catch {
    return '/';
  }
}

/**
 * 从元素向上查找最近的可滚动容器（overflow-y: auto/scroll）。
 * 找不到时返回 window。用于滚动渐变导航栏自动定位滚动监听目标。
 */
function findScrollContainer(el) {
  let node = el?.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return node;
    }
    node = node.parentElement;
  }
  return window;
}

/** 默认返回箭头图标（颜色随 color 变化） */
function BackArrow({ color }) {
  return (
    <svg
      width="0.2rem"
      height="0.2rem"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

export default function QNavbar({
  title,
  transparent = false,
  backgroundColor,
  color = '#1a1a1a',
  showBack = true,
  onBack,
  left,
  right,
  fixed = false,
  safeAreaInsetTop = false,
  placeholder = false,
  /** 滚动渐变阈值（px）：transparent + fixed 时，下滑超过此值背景完全变白 */
  scrollThreshold = 80,
  style,
}) {
  const navigate = useNavigate();
  /** 包裹 NavBar 的外层 div ref，用于操作 CSS 变量实现滚动渐变（不触发 React 重渲染） */
  const wrapperRef = useRef(null);

  /** 初始背景色：transparent 模式从全透明白开始，由滚动渐变控制；非 transparent 模式固定色 */
  const initialBg = transparent ? 'rgba(255, 255, 255, 0)' : backgroundColor || '#ffffff';

  /**
   * 滚动渐变效果：仅 transparent + fixed 模式启用。
   * 下滑时背景从透明 → 白色，回到顶部恢复透明。
   * 直接操作 wrapper 的 CSS 变量，避免 React 重渲染；requestAnimationFrame 节流。
   */
  useEffect(() => {
    if (!fixed || !transparent || !wrapperRef.current) return;

    const scrollContainer = findScrollContainer(wrapperRef.current);
    let ticking = false;

    const updateBackground = () => {
      const scrollTop = scrollContainer === window
        ? window.scrollY || window.pageYOffset
        : scrollContainer.scrollTop;
      const opacity = Math.min(Math.max(scrollTop / scrollThreshold, 0), 1);
      wrapperRef.current?.style.setProperty(
        '--nutui-navbar-background',
        `rgba(255, 255, 255, ${opacity})`,
      );
      ticking = false;
    };

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(updateBackground);
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    updateBackground(); // 初始化（页面可能已有滚动位置）

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [fixed, transparent, scrollThreshold]);

  /** 返回处理：默认 history 后退，可传 onBack 覆盖 */
  const handleBack = () => {
    if (typeof onBack === 'function') {
      onBack();
    } else {
      navigate(-1);
    }
  };

  /** 返回点击埋点（对齐 QButton 埋点规范） */
  const handleBackTrack = () => {
    if (window.RN && typeof window.RN.LOG?.INFO === 'function') {
      window.RN.LOG.INFO({
        event: 'button_click',
        page: getCurrentPage(),
        button: 'nav_back',
        fn: 'handleBack',
        data: { timestamp: Date.now() },
      }).catch(() => {});
    }
    handleBack();
  };

  return (
    <>
      {/* 外层 wrapper：高度为 0（NavBar fixed 脱离文档流），不影响布局；
          CSS 变量设在此处继承给 NavBar，滚动渐变直接操作此元素样式 */}
      <div ref={wrapperRef} style={{ '--nutui-navbar-background': initialBg }}>
        <NavBar
          title={title}
          left={left}
          right={right}
          back={
            showBack ? (
              <BackArrow color={color} />
            ) : null
          }
          onBackClick={handleBackTrack}
          fixed={fixed}
          safeAreaInsetTop={safeAreaInsetTop}
          placeholder={placeholder}
          style={{
            // 注意：--nutui-navbar-background 不在此设置，由外层 wrapper 控制（支持滚动渐变）
            '--nutui-navbar-height': NAVBAR_HEIGHT,
            '--nutui-navbar-title-font-color': color,
            height: NAVBAR_HEIGHT,
            paddingTop: 'var(--status-bar-height)',
            // fixed 模式强制提升为独立合成层：滚动时仅移动内容层，
            // 避免透明导航栏与下方内容每帧重新合成（WebView 长页面卡顿根因）
            ...(fixed ? {
              transform: 'translateZ(0)',
              WebkitTransform: 'translateZ(0)',
              willChange: 'transform',
              zIndex: 100,
            } : {}),
            ...style,
          }}
        />
      </div>
      {fixed && !placeholder && (
        <div
          className="qnavbar-holder"
          style={{ height: `calc(${NAVBAR_HEIGHT} + var(--status-bar-height))` }}
        />
      )}
    </>
  );
}
