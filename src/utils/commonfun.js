/**
 * 全局通用工具函数（跨页面/组件复用）。
 */

/**
 * 平台检测（优先基座注入，避免 UA 判断不准确）。
 * 优先级：
 *   1. RN api.js 注入的同步常量 window.RN.PLATFORM（rn 环境 = android/ios，浏览器 = web）
 *   2. 基座原生注入的 window.RN_PLATFORM（RN Platform.OS 原生确定值）
 *   3. 兜底：'android'
 * 异步等效 API：RN.SYSTEM.GETPLATFORM() -> { os }
 * @returns {'android'|'ios'|'web'|string}
 */
export function getPlatform() {
  try {
    if (typeof window !== 'undefined' && window.RN && window.RN.PLATFORM) {
      return window.RN.PLATFORM;
    }
    if (typeof window !== 'undefined' && window.RN_PLATFORM) {
      return window.RN_PLATFORM;
    }
  } catch (e) {
    /* 忽略读取异常，走兜底 */
  }
  return 'android';
}
