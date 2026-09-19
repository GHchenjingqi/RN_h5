/**
 * =====================================================================
 * 持久化存储方案（localStorage 封装）
 * =====================================================================
 * 特性：
 *   1. 底层使用 localStorage（RN WebView / 浏览器均可用）；
 *   2. 兜底：localStorage 不可用（隐私模式 / 部分 file:// WebView）时
 *      自动降级为内存存储，保证功能不崩溃（刷新后丢失，可用 isPersistent() 感知）；
 *   3. 自动 JSON 序列化 / 反序列化，可存储对象、数组、布尔、数字等；
 *   4. 命名空间：默认前缀 'base_h5:'，避免与基座 / 其他子包 key 冲突；
 *   5. 提供 createStorage(namespace) 创建业务级命名空间存储。
 *
 * 使用示例：
 *   import { setItem, getItem, createStorage } from '../utils/storage';
 *   setItem('token', 'abc123');
 *   getItem('token', null);                 // 'abc123'
 *   const settings = createStorage('settings');
 *   settings.set('theme', 'dark');
 *   settings.get('theme');                  // 'dark'
 * =====================================================================
 */

const DEFAULT_NAMESPACE = 'base_h5';

// 探测 localStorage 是否可用（file:// 或隐私模式下访问可能抛异常）
const storage = (() => {
  try {
    const probe = '__jy_probe__';
    const s = window.localStorage;
    s.setItem(probe, '1');
    s.removeItem(probe);
    return s;
  } catch (e) {
    return null;
  }
})();

// 内存兜底容器（localStorage 不可用时使用）
const memoryStore = new Map();

function fullKey(key) {
  return `${DEFAULT_NAMESPACE}:${key}`;
}

function rawGet(k) {
  if (storage) {
    const v = storage.getItem(k);
    return v == null ? undefined : v;
  }
  return memoryStore.get(k);
}

function rawSet(k, v) {
  if (storage) {
    storage.setItem(k, v);
  } else {
    memoryStore.set(k, v);
  }
}

function rawRemove(k) {
  if (storage) {
    storage.removeItem(k);
  } else {
    memoryStore.delete(k);
  }
}

/**
 * 读取 key 对应的值；未命中返回 defaultValue。
 * 自动 JSON 反序列化；兼容历史遗留的非 JSON 文本（原样返回）。
 */
export function getItem(key, defaultValue = null) {
  const raw = rawGet(fullKey(key));
  if (raw === undefined || raw === null) return defaultValue;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return raw;
  }
}

/** 写入 key，自动 JSON 序列化。 */
export function setItem(key, value) {
  rawSet(fullKey(key), JSON.stringify(value));
}

/** 删除单个 key。 */
export function removeItem(key) {
  rawRemove(fullKey(key));
}

/**
 * 清空本应用命名空间下的存储。
 * @param {string} subPrefix 可选，仅清空匹配子前缀的 key（如 'settings:'）。
 */
export function clear(subPrefix = '') {
  const prefix = fullKey(subPrefix);
  if (storage) {
    const keys = [];
    for (let i = 0; i < storage.length; i += 1) {
      const k = storage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach((k) => storage.removeItem(k));
  } else {
    [...memoryStore.keys()].forEach((k) => {
      if (k.startsWith(prefix)) memoryStore.delete(k);
    });
  }
}

/**
 * 业务级命名空间存储。
 * 例：const s = createStorage('settings'); s.set('theme','dark');
 * 实际 key 为 'base_h5:settings:theme'。
 */
export function createStorage(namespace) {
  const prefix = `${namespace}:`;
  return {
    get: (key, defaultValue = null) => getItem(`${prefix}${key}`, defaultValue),
    set: (key, value) => setItem(`${prefix}${key}`, value),
    remove: (key) => removeItem(`${prefix}${key}`),
    clear: () => clear(prefix),
  };
}

/** 是否真正持久化到本地（false 表示处于内存兜底，刷新即失）。 */
export function isPersistent() {
  return storage !== null;
}

/** 估算当前命名空间占用（KB），localStorage 不可用时返回 0。 */
export function estimateSize() {
  if (!storage) return 0;
  const prefix = `${DEFAULT_NAMESPACE}:`;
  let bytes = 0;
  for (let i = 0; i < storage.length; i += 1) {
    const k = storage.key(i);
    if (k && k.startsWith(prefix)) {
      bytes += (k.length + String(storage.getItem(k) || '').length) * 2;
    }
  }
  return Math.round(bytes / 1024);
}
