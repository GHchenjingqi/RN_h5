import { useRef, useCallback } from 'react';
import { Button } from '@nutui/nutui-react';
import './qbutton.css';

/**
 * QButton：基于 NutUI Button 的二次封装。
 *
 * 增强能力：
 * 1. 默认撑满宽度 100%（可通过 style/width 覆盖）；
 * 2. 防抖处理：500ms 内只允许点击一次（DEBOUNCE_MS 可调）；
 * 3. 点击埋点：自动通过 RN.LOG.INFO 记录 h5_event_log 日志，
 *    参数对齐基座 LogParams 规范（event/page/button/fn/data）。
 *
 * 埋点日志字段：
 *   event:  'button_click'（固定）
 *   page:   当前页面路径（hash 路由取 location.hash）
 *   button: 按钮标识（优先 trackId，其次按钮文字）
 *   fn:     触发的函数名（onClick 的函数名，无则 anonymous）
 *   data:   { trackId, timestamp }（结构化附加数据，无需 JSON.stringify）
 *
 * 用法：
 *   <QButton onClick={handleLogin} trackId="login_submit">登录</QButton>
 */
const DEBOUNCE_MS = 500;

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

/** 从 children 中提取按钮文字（用于 button 标识的备选）。 */
function extractButtonText(children) {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) {
    return children.map(extractButtonText).filter(Boolean).join('');
  }
  return '';
}

export default function QButton({
  onClick,
  onTrack,
  trackId,
  type,
  style,
  className,
  children,
  ...rest
}) {
  const lastClickRef = useRef(0);

  const handleClick = useCallback(
    (e) => {
      const now = Date.now();
      if (now - lastClickRef.current < DEBOUNCE_MS) return;
      lastClickRef.current = now;

      // 按钮标识：优先 trackId，其次按钮文字，最后 unknown
      const buttonLabel = trackId || extractButtonText(children) || 'unknown';
      // 触发函数名
      const fnName = (onClick && onClick.name) || 'anonymous';
      // 当前页面
      const page = getCurrentPage();

      // 结构化埋点数据（传给 onTrack 钩子和 LOG.data）
      const trackData = {
        trackId: trackId || null,
        button: buttonLabel,
        page,
        fn: fnName,
        timestamp: now,
      };

      // 1. 外部埋点钩子（透传结构化数据）
      if (typeof onTrack === 'function') {
        onTrack(trackData);
      }

      // 2. RN Bridge 日志（对齐基座 LogParams 规范）
      if (window.RN && typeof window.RN.LOG?.INFO === 'function') {
        window.RN.LOG.INFO({
          event: 'button_click',
          page,
          button: buttonLabel,
          fn: fnName,
          data: {
            trackId: trackId || null,
            timestamp: now,
          },
        }).catch(() => {});
      }

      // 3. 执行业务点击
      if (typeof onClick === 'function') {
        onClick(e);
      }
    },
    [onClick, onTrack, trackId, children],
  );

  return (
    <Button
      {...rest}
      type={type === 'cancel' || type === 'confirm' || type === 'confrim' ? 'default' : type}
      onClick={handleClick}
      className={`q-button ${type === 'cancel' ? 'q-button--cancel' : ''} ${type === 'confirm' || type === 'confrim' ? 'q-button--confirm' : ''} ${className || ''}`.trim()}
      style={style}
    >
      {children}
    </Button>
  );
}
