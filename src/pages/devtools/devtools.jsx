import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  WATCH_EVENTS,
  bridgeAvailable,
  bridgeSnapshot,
  handshake,
  probeCapabilities,
  stateView,
  subscribeEvents,
} from '../../utils/bridge';
import './devtools.css';

/**
 * 能力测试台：Bridge 连接状态 + 模块能力矩阵 + 原生事件流。
 *
 * 一次 app.getCapabilities 探测驱动整张矩阵：能力位 true/false 决定「支持 / 不支持」，
 * 基座未上报该能力位则标记「未接入原生」，与设备本身不支持区分开。
 * 运行环境与接口自动化测试在首页（/）。
 */

/** cap=对应基座能力位；null 表示核心模块，握手就绪即可用；apis=中间件暴露的方法数。 */
const MODULES = [
  { key: 'app', cn: '应用', desc: '应用信息 / 版本 / 能力清单 / 握手', path: '/test/app', cap: null, apis: 5, color: '#1677ff' },
  { key: 'system', cn: '系统', desc: '系统信息 / 剪贴板 / 分享 / 震动', path: '/test/system', cap: null, apis: 12, color: '#722ed1' },
  { key: 'camera', cn: '相机', desc: '相机拍照', path: '/test/camera', cap: 'camera', apis: 1, color: '#fa8c16' },
  { key: 'scanner', cn: '扫码', desc: '条形码 / 二维码扫码', path: '/test/scanner', cap: 'scanner', apis: 1, color: '#52c41a' },
  { key: 'location', cn: '定位', desc: '定位 / 经纬度', path: '/test/location', cap: 'location', apis: 1, color: '#13c2c2' },
  { key: 'nfc', cn: 'NFC', desc: 'NFC 标签读写', path: '/test/nfc', cap: 'nfc', apis: 3, color: '#2f54eb' },
  { key: 'file', cn: '文件', desc: '文件选择 / 读取 / 下载', path: '/test/file', cap: 'filePicker', apis: 5, color: '#eb2f96' },
  { key: 'media', cn: '媒体', desc: '选图 / 保存图片', path: '/test/media', cap: 'filePicker', apis: 2, color: '#a0d911' },
  { key: 'notification', cn: '通知', desc: '推送 Token / 角标 / 提示音', path: '/test/notification', cap: 'notification', apis: 4, color: '#f5222d' },
  { key: 'auth', cn: '账号', desc: '登录 Token / 用户 / 登出', path: '/test/auth', cap: null, apis: 3, color: '#08979c' },
  { key: 'permission', cn: '权限', desc: '权限检查 / 请求 / 系统设置', path: '/test/permission', cap: null, apis: 3, color: '#faad14' },
  { key: 'log', cn: '日志', desc: '日志写入基座', path: '/test/log', cap: null, apis: 4, color: '#595959' },
  { key: 'network', cn: '网络', desc: '网络状态', path: '/test/network', cap: null, apis: 1, color: '#eb6bbb' },
];

/** 中间件暴露的接口总数（hero 摘要用）。 */
const TOTAL_APIS = MODULES.reduce((sum, m) => sum + m.apis, 0);

const STATUS_LABELS = {
  ok: '支持',
  no: '不支持',
  native: '未接入原生',
  pending: '探测中',
  idle: '未就绪',
};

const MAX_EVENTS = 30;

function formatTime(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function statusOf(mod, { probed, ready, caps }) {
  if (!probed) return 'pending';
  if (mod.cap === null) return ready ? 'ok' : 'idle';
  if (!(mod.cap in caps)) return 'native';
  return caps[mod.cap] ? 'ok' : 'no';
}

export default function DevTools() {
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const [snap, setSnap] = useState(bridgeSnapshot);
  const [probe, setProbe] = useState({ probed: false, loading: false, caps: {}, platform: '', error: null });
  const [events, setEvents] = useState([]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setProbe((prev) => ({ ...prev, loading: true }));
    setSnap(bridgeSnapshot());
    const res = await probeCapabilities();
    if (!mountedRef.current) return;
    setProbe({ ...res, probed: true, loading: false });
    setSnap(bridgeSnapshot());
  }, []);

  useEffect(() => {
    if (!bridgeAvailable()) {
      setProbe({ probed: false, loading: false, caps: {}, platform: '', error: { code: 'BRIDGE_NOT_INJECTED', message: 'window.RN 未注入' } });
      return;
    }
    refresh();
    // 每 3s 回读状态机与队列长度（同步读值，不产生请求）
    const timer = setInterval(() => setSnap(bridgeSnapshot()), 3000);
    return () => clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    return subscribeEvents(WATCH_EVENTS, (name, payload, at) => {
      if (!mountedRef.current) return;
      setEvents((prev) => [{ name, payload, at }, ...prev].slice(0, MAX_EVENTS));
      if (name === 'bridge.ready' || name === 'app.ready') {
        setSnap(bridgeSnapshot());
      }
    });
  }, []);

  const ready = snap.isReady || snap.state === 'ready';
  const { label: stateLabel, tone: stateTone } = stateView(snap.state);
  const rows = useMemo(() => MODULES.map((m) => ({ ...m, status: statusOf(m, { ...probe, ready }) })), [probe, ready]);
  const counts = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  const reconnect = async () => {
    await handshake(true);
    refresh();
  };

  return (
    <div className="devtools-page page-container">
      <header className="page-hero">
        <div className="page-hero__row">
          <div>
            <p className="page-hero__eyebrow">Bridge 能力矩阵</p>
            <h1 className="page-hero__title">能力测试台</h1>
          </div>
          <span className={`q-status ${stateTone ? `q-status--${stateTone}` : ''}`}>{stateLabel}</span>
        </div>
        <p className="page-hero__desc">
          {snap.env === 'browser' ? '浏览器 Mock 环境 · 结果不代表真机' : `真机 WebView · ${snap.platform || '待探测'}`}
          {` · ${MODULES.length} 个模块 / ${TOTAL_APIS} 个接口`}
        </p>
      </header>

      <section className="devtools-card ui-card">
        <div className="devtools-card__head">
          <h2 className="devtools-card__title">能力矩阵</h2>
          <span className="devtools-summary">
            支持 {counts.ok || 0} · 不支持 {counts.no || 0} · 未接入 {counts.native || 0}
          </span>
        </div>
        <ul className="devtools-matrix">
          {rows.map((m) => (
            <li key={m.key}>
              <button type="button" className="devtools-row" onClick={() => navigate(m.path)}>
                <span className="devtools-row__mark" style={{ background: m.color }}>
                  {m.cn}
                </span>
                <span className="devtools-row__main">
                  <span className="devtools-row__name">
                    {m.key.toUpperCase()}
                    <em className="devtools-row__apis">{m.apis} 个接口</em>
                  </span>
                  <span className="devtools-row__desc">{m.desc}</span>
                </span>
                <span className={`devtools-tag devtools-tag--${m.status}`}>{STATUS_LABELS[m.status]}</span>
                <span className="devtools-row__arrow" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="devtools-card ui-card">
        <div className="devtools-card__head">
          <h2 className="devtools-card__title">Bridge 连接</h2>
          <button type="button" className="devtools-btn" onClick={reconnect}>
            重新握手
          </button>
        </div>
        <div className="devtools-chips">
          <span className="devtools-chip">环境：{snap.env || '-'}</span>
          <span className="devtools-chip">平台：{snap.platform || '-'}</span>
          <span className="devtools-chip">Bridge：v{snap.bridgeVersion || '-'}</span>
          <span className="devtools-chip">SDK：v{snap.sdkVersion || '-'}</span>
          <span className="devtools-chip">协议：{snap.protocolVersion || '-'}</span>
          <span className="devtools-chip">AppId：{snap.appId || '-'}</span>
          <span className="devtools-chip">H5：v{snap.h5Version || '-'}</span>
          <span className={`devtools-chip devtools-chip--${snap.queueSize > 0 ? 'warn' : ''}`}>
            排队：{snap.queueSize}
          </span>
        </div>
        {probe.error && (
          <p className="devtools-error">[{probe.error.code}] {probe.error.message}</p>
        )}
      </section>

      <section className="devtools-card ui-card">
        <div className="devtools-card__head">
          <h2 className="devtools-card__title">原生事件流</h2>
          {events.length > 0 && (
            <button type="button" className="devtools-btn" onClick={() => setEvents([])}>
              清空
            </button>
          )}
        </div>
        <p className="devtools-card__hint">
          监听 {WATCH_EVENTS.length} 类事件：前后台切换、握手回执、深色模式、键盘…
        </p>
        {events.length === 0 ? (
          <p className="devtools-empty">暂无事件</p>
        ) : (
          <ul className="devtools-events">
            {events.map((e, i) => (
              <li key={`${e.name}_${e.at}_${i}`} className="devtools-event">
                <span className="devtools-event__time">{formatTime(e.at)}</span>
                <span className="devtools-event__name">{e.name}</span>
                <span className="devtools-event__data">
                  {e.payload === undefined || e.payload === null
                    ? '—'
                    : typeof e.payload === 'object'
                      ? JSON.stringify(e.payload)
                      : String(e.payload)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
