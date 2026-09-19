/**
 * 状态栏高度工具：从基座获取真实状态栏高度，写入全局 CSS 变量 --status-bar-height。
 *
 * 背景：
 *   - CSS env(safe-area-inset-top) 在 Android WebView 下通常返回 0，
 *     导致导航栏/页面顶部与系统状态栏重叠；
 *   - 基座提供 RN.SYSTEM.GETSTATUSBARHEIGHT()（Android 取 StatusBar.currentHeight），
 *     H5 在入口调用后将 px 值写入 :root 的 --status-bar-height，
 *     所有页面通过 var(--status-bar-height) 避让即可。
 *
 * 单位说明：
 *   状态栏高度为系统级固定值，与导航栏 56/44px 同属 rem 规范的合理例外，
 *   直接使用 px，不做 rem 换算。
 *
 * 浏览器环境：api.js mock 返回 { statusBarHeight: 0 }，不影响本地开发。
 */

/** 状态栏高度 fallback（基座获取不到时使用，单位 px）。 */
const DEFAULT_STATUS_BAR_HEIGHT = 44;

/** 从基座获取状态栏高度并写入 CSS 变量（异步，不阻塞首屏渲染）。 */
export async function applyStatusBarHeight() {
  let h = DEFAULT_STATUS_BAR_HEIGHT;
  try {
    if (window.RN?.SYSTEM?.GETSTATUSBARHEIGHT) {
      const res = await window.RN.SYSTEM.GETSTATUSBARHEIGHT();
      const real = Number(res?.statusBarHeight);
      if (real > 0) h = real;
    }
  } catch (e) {
    console.warn('[statusBar] 获取状态栏高度失败，使用默认值:', DEFAULT_STATUS_BAR_HEIGHT, e);
  }
  console.log('[statusBar] 最终状态栏高度:', h, 'px');
  document.documentElement.style.setProperty('--status-bar-height', `${h}px`);
}
