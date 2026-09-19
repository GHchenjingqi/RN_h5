/**
 * 通用加载态组件：懒加载页面 / 异步数据的统一兜底。
 * 用法：<Loading text="加载中…" />
 */
import './loading.css';
export default function Loading({ text = '加载中…' }) {
  return <div className="loading-state">{text}</div>;
}
