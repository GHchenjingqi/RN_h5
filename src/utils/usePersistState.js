import { useEffect, useState } from 'react';
import { getItem, setItem } from './storage';

/**
 * 持久化 state Hook：
 * - 初始化时从 storage 恢复值（无值时用 initialValue）；
 * - state 每次变化自动写回 storage（刷新 / 重启 App 后仍然保留）。
 *
 * 使用示例：
 *   const [theme, setTheme] = usePersistState('theme', 'light');
 *   const [user, setUser] = usePersistState('user', null);
 *
 * @param {string} key        存储 key（自动加 'base_h5:' 默认命名空间）
 * @param {*}      initialValue 初始值（storage 无值时使用）
 * @param {object} [options]
 * @param {boolean} [options.skipInitRead] 跳过初始化读取（直接使用 initialValue）
 * @returns {[any, (next: any) => void]}
 */
export function usePersistState(key, initialValue, options = {}) {
  const { skipInitRead = false } = options;

  // 惰性初始化：优先读 storage，保证首帧就有持久化数据
  const [state, setState] = useState(() => {
    if (skipInitRead) return initialValue;
    const saved = getItem(key);
    // 注意：getItem 未命中返回 defaultValue(null)；这里用 null 区分“未存过”
    return saved === null ? initialValue : saved;
  });

  // state 每次变化（含首次挂载的初始值）都写回 storage
  useEffect(() => {
    setItem(key, state);
  }, [key, state]);

  return [state, setState];
}
