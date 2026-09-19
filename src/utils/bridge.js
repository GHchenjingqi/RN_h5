/**
 * Bridge 启动与探测工具。
 *
 * 为什么需要它：基座侧不会主动向 H5 推送 ready，连接状态机必须由 H5 调用
 * RN.READY 启动；未握手时所有请求只会排队直到超时。此前 app_h5 只在首页把
 * READY 当成一项「测试」来点，握手时机完全不确定。
 *
 * __H5_VERSION__ 由 vite define 注入（真源：app.config.json）；
 * appId 由 index.html 在 api.js 之前写入 window.__H5_APP_ID__。
 */
/** 当前 H5 构建版本（构建期来自 app.config.json 的 versionName）。 */
export const H5_VERSION = typeof __H5_VERSION__ === 'undefined' ? 'dev' : __H5_VERSION__;

/** 需要调试台监听的事件名（与基座 protocol.ts 的事件常量保持一致）。 */
export const WATCH_EVENTS = [
  'bridge.ready',
  'app.ready',
  'app.resume',
  'app.background',
  'app.lifecycle',
  'system.darkmodechange',
  'keyboard.didShow',
  'keyboard.didHide',
];

/** window.RN 是否已注入。 */
export function bridgeAvailable() {
  return typeof window !== 'undefined' && !!window.RN;
}

/** 连接状态机 → 展示文案与 .q-status 修饰类（首页与能力测试台共用）。 */
export function stateView(state) {
  if (state === 'ready') return { label: '已就绪', tone: 'ok' };
  if (state === 'connected') return { label: '已连接', tone: 'connected' };
  if (state === 'connecting') return { label: '连接中', tone: 'connecting' };
  if (state === 'disconnected') return { label: '未连接', tone: 'idle' };
  return { label: '探测中', tone: '' };
}

let handshakePromise = null;

/**
 * 发起握手（幂等）：默认复用同一 Promise，避免入口与页面重复发请求。
 * force=true 时强制重发（RN.READY 内部对已 ready 的情况直接返回当前回执）。
 */
export function handshake(force) {
  if (!bridgeAvailable() || typeof window.RN.READY !== 'function') {
    return Promise.resolve(null);
  }
  if (!handshakePromise || force) {
    handshakePromise = Promise.resolve(
      window.RN.READY({ h5Version: H5_VERSION, appId: window.RN.APP_ID }),
    ).catch(() => null);
  }
  return handshakePromise;
}

/** 握手/环境快照：状态机 + 队列 + 版本信息，供调试台轮询展示。 */
export function bridgeSnapshot() {
  if (!bridgeAvailable()) {
    return { available: false, state: '', isReady: false, queueSize: 0, env: '' };
  }
  const RN = window.RN;
  return {
    available: true,
    h5Version: H5_VERSION,
    state: typeof RN.STATE === 'function' ? RN.STATE() : '',
    isReady: typeof RN.ISREADY === 'function' ? RN.ISREADY() : false,
    queueSize: typeof RN.QUEUESIZE === 'function' ? RN.QUEUESIZE() : 0,
    env: RN.ENV || '',
    platform: RN.PLATFORM || '',
    bridgeVersion: RN.VERSION || '',
    sdkVersion: RN.SDK_VERSION || '',
    protocolVersion: RN.PROTOCOL_VERSION || '',
    appId: RN.APP_ID || '',
  };
}

/**
 * 直连 app.getCapabilities 探测能力清单（绕过 SDK 缓存：
 * RN.GETCAPABILITIES 命中缓存后不再发请求，无法用于「刷新」）。
 */
export async function probeCapabilities() {
  if (!bridgeAvailable() || !window.RN.APP?.GETCAPABILITIES) {
    return {
      caps: {},
      platform: '',
      bridgeVersion: '',
      error: { code: 'BRIDGE_NOT_INJECTED', message: 'window.RN 未注入，请在基座 App 内打开' },
    };
  }
  try {
    const res = (await window.RN.APP.GETCAPABILITIES()) || {};
    return {
      caps: res.features || {},
      platform: res.platform || '',
      bridgeVersion: res.bridgeVersion || '',
      error: null,
    };
  } catch (e) {
    return {
      caps: {},
      platform: '',
      bridgeVersion: '',
      error: e || { code: 'UNKNOWN_ERROR', message: '能力探测失败' },
    };
  }
}

/**
 * 批量订阅事件，返回统一取消订阅函数。
 * handler 收到 (name, payload, receivedAt)，时间戳在此打点，避免调用方各写一份。
 */
export function subscribeEvents(names, handler) {
  if (!bridgeAvailable() || typeof window.RN.ON !== 'function') {
    return () => {};
  }
  const offs = names.map((name) =>
    window.RN.ON(name, (payload) => {
      handler(name, payload, Date.now());
    }),
  );
  return () => {
    offs.forEach((off) => {
      if (typeof off === 'function') off();
    });
  };
}
