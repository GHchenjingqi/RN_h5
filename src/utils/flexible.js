/**
 * =====================================================================
 * rem 适配脚本（移动端 H5）
 * =====================================================================
 * 方案：设计稿宽度 375px，1rem = 100px（便于 px → rem 换算：rem = px / 100）。
 *
 * 原理：根据设备实际视口宽度等比缩放 html 根字体大小，
 *       使 1rem 在任意设备上始终等于设计稿的 100px 等比值。
 *
 * 示例（设计稿 375px）：
 *   16px  → 0.16rem
 *   24px  → 0.24rem
 *   52px  → 0.52rem
 *   375px → 3.75rem（满屏宽）
 *
 * 注意：
 *   - 项目中禁止使用 px 物理像素，统一使用 rem；
 *   - 1px 边框等特殊场景可用 0.01rem（在 375px 设计稿下等于 1px）；
 *   - vh / vw / % 等相对单位不受限制。
 * =====================================================================
 */

const DESIGN_WIDTH = 375;
const REM_BASE = 100;
const MAX_FONT_SIZE = 200;

function setRemUnit() {
  const clientWidth =
    document.documentElement.clientWidth ||
    window.innerWidth ||
    document.body.clientWidth;
  if (!clientWidth) return;
  let fontSize = (clientWidth / DESIGN_WIDTH) * REM_BASE;
  if (fontSize > MAX_FONT_SIZE) fontSize = MAX_FONT_SIZE;
  document.documentElement.style.fontSize = `${fontSize}px`;
}

setRemUnit();

let resizeTimer = null;
window.addEventListener(
  'resize',
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setRemUnit, 100);
  },
  false,
);
window.addEventListener(
  'orientationchange',
  () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setRemUnit, 100);
  },
  false,
);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    setTimeout(setRemUnit, 100);
  }
});

export default setRemUnit;
