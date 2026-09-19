import { useCallback, useEffect, useRef, useState } from 'react';
import { PullToRefresh, Toast } from '@nutui/nutui-react';
import { H5_VERSION, stateView } from '../../utils/bridge';
import './home.css';

/**
 * 基座首页：运行环境 + 接口测试详情（原 devtools 内容整合到首页）。
 * 去掉了旧版「重新测试」按钮，改为下拉刷新触发 runAll。
 */

const TEST_TIMEOUT_MS = 10000;

const CAPABILITY_KEYS = ['camera', 'scanner', 'location', 'filePicker', 'share', 'nfc', 'notification'];
const CAPABILITY_LABELS = {
  camera: '相机',
  scanner: '扫码',
  location: '定位',
  filePicker: '文件选择',
  share: '分享',
  nfc: 'NFC',
  notification: '推送',
};

const TESTS = [
  { id: 'app.getInfo', label: '应用信息', run: () => window.RN.APP.GETINFO() },
  { id: 'system.getInfo', label: '系统信息', run: () => window.RN.SYSTEM.GETINFO() },
  { id: 'system.getStatusBarHeight', label: '状态栏高度', run: () => window.RN.SYSTEM.GETSTATUSBARHEIGHT() },
  { id: 'system.getScreenInfo', label: '屏幕信息', run: () => window.RN.SYSTEM.GETSCREENINFO() },
  { id: 'system.getLanguage', label: '语言', run: () => window.RN.SYSTEM.GETLANGUAGE() },
  { id: 'system.getDarkMode', label: '深色模式', run: () => window.RN.SYSTEM.GETDARKMODE() },
  { id: 'system.getBattery', label: '电量', run: () => window.RN.SYSTEM.GETBATTERY() },
  { id: 'auth.getToken', label: '登录 Token', run: () => window.RN.AUTH.GETTOKEN() },
  { id: 'auth.getUser', label: '当前用户', run: () => window.RN.AUTH.GETUSER() },
  { id: 'network.getStatus', label: '网络状态', run: () => window.RN.NETWORK.GETSTATUS() },
  { id: 'notification.getToken', label: '推送 Token', run: () => window.RN.NOTIFICATION.GETTOKEN() },
  { id: 'bridge.ready', label: '握手 Ready', run: () => window.RN.READY({ h5Version: H5_VERSION }).then((res) => ({ state: res?.state, capabilities: res?.capabilities })) },
  { id: 'waitUntilReady', label: '等待握手', run: () => window.RN.WAITUNTILREADY(5000).then((caps) => ({ ready: true, hasCaps: !!caps })) },
  { id: 'hasCapability', label: '能力检测', run: () => window.RN.HASCAPABILITY('camera').then((ok) => ({ camera: ok })) },
];

const initialResults = () => TESTS.map((t) => ({ id: t.id, label: t.label, status: 'pending' }));

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject({ code: 'TIMEOUT', message: `测试超时（${ms / 1000}s）` }), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function runTest(run, ms) {
  const start = Date.now();
  return withTimeout(Promise.resolve().then(() => run()), ms)
    .then((data) => ({ status: 'success', data, duration: Date.now() - start }))
    .catch((err) => ({
      status: err?.code === 'TIMEOUT' ? 'timeout' : 'error',
      error: err,
      duration: Date.now() - start,
    }));
}

export default function Home() {
  const mountedRef = useRef(true);
  const [env, setEnv] = useState('');
  const [platform, setPlatform] = useState('');
  const [version, setVersion] = useState('');
  const [appVersion, setAppVersion] = useState('');
  const [sdkVersion, setSdkVersion] = useState('');
  const [protocolVersion, setProtocolVersion] = useState('');
  const [appId, setAppId] = useState('');
  const [bridgeState, setBridgeState] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [queueSize, setQueueSize] = useState(0);
  const [capabilities, setCapabilities] = useState({});
  const [capsLoading, setCapsLoading] = useState(true);
  const [results, setResults] = useState(initialResults);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const runAll = useCallback(async () => {
    if (!window.RN) {
      Toast.show('RN 桥接未注入');
      return;
    }
    setResults(initialResults());
    await Promise.all(
      TESTS.map((t, i) =>
        runTest(t.run, TEST_TIMEOUT_MS).then((outcome) => {
          if (!mountedRef.current) return;
          setResults((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...outcome } : r)));
        }),
      ),
    );
  }, []);

  useEffect(() => {
    if (!window.RN) {
      setCapsLoading(false);
      return;
    }
    setEnv(window.RN.ENV || '');
    setPlatform(window.RN.PLATFORM || '');
    setVersion(window.RN.VERSION || '');
    setSdkVersion(window.RN.SDK_VERSION || '');
    setProtocolVersion(window.RN.PROTOCOL_VERSION || '');
    setAppId(window.RN.APP_ID || '');
    // 获取基座 app 版本（version.json 中的 versionName，非 Bridge 版本）
    if (window.RN.APP?.GETVERSION) {
      window.RN.APP.GETVERSION()
        .then((res) => setAppVersion(res?.appVersion || ''))
        .catch(() => setAppVersion(''));
    }
    const refreshState = () => {
      setBridgeState(window.RN.STATE ? window.RN.STATE() : '');
      setIsReady(window.RN.ISREADY ? window.RN.ISREADY() : false);
      setQueueSize(window.RN.QUEUESIZE ? window.RN.QUEUESIZE() : 0);
    };
    refreshState();
    window.RN.GETCAPABILITIES()
      .then((caps) => setCapabilities(caps || {}))
      .catch(() => setCapabilities({}))
      .finally(() => setCapsLoading(false));
    runAll();
    const stateTimer = setInterval(refreshState, 2000);
    return () => clearInterval(stateTimer);
  }, [runAll]);

  const okCount = results.filter((r) => r.status === 'success').length;
  const timeoutCount = results.filter((r) => r.status === 'timeout').length;
  const errCount = results.filter((r) => r.status === 'error').length;
  const { label: stateLabel, tone: stateTone } = stateView(bridgeState);

  return (
    <div className="home-page page-container">
      <PullToRefresh onRefresh={runAll} style={{ minHeight: '100%' }}>
        {/* 顶部：无导航栏，页面自绘通栏头部（含状态栏避让） */}
        <header className="page-hero">
          <div className="page-hero__row">
            <div>
              <p className="page-hero__eyebrow">RN 基座 · H5 调试台</p>
              <h1 className="page-hero__title">运行环境总览</h1>
            </div>
            <span className={`q-status ${stateTone ? `q-status--${stateTone}` : ''}`}>{stateLabel}</span>
          </div>
          <p className="page-hero__desc">
            {env === 'browser' ? '浏览器 Mock 环境' : '真机 WebView'} · {platform || '-'} · 基座 v{appVersion || '-'} · H5 v{H5_VERSION}
          </p>
          <div className="home-stats">
            <span className="home-stat">
              <b>{results.length}</b>接口
            </span>
            <span className="home-stat home-stat--ok">
              <b>{okCount}</b>正常
            </span>
            <span className={`home-stat ${timeoutCount ? 'home-stat--warn' : ''}`}>
              <b>{timeoutCount}</b>超时
            </span>
            <span className={`home-stat ${errCount ? 'home-stat--err' : ''}`}>
              <b>{errCount}</b>异常
            </span>
          </div>
        </header>

        <div className="home-body">
          {/* 运行环境 */}
          <section className="home-card ui-card">
            <h2 className="home-card__title">运行环境</h2>
            <div className="home-env">
              <span className="home-chip">环境：{env || '-'}</span>
              <span className="home-chip">Bridge：v{version || '-'}</span>
              <span className="home-chip">SDK：v{sdkVersion || '-'}</span>
              <span className="home-chip">协议：{protocolVersion || '-'}</span>
              <span className="home-chip">AppId：{appId || '-'}</span>
              <span className="home-chip">Ready：{isReady ? '是' : '否'}</span>
              <span className={`home-chip ${queueSize > 0 ? 'home-chip--warn' : ''}`}>排队：{queueSize}</span>
            </div>
            <h3 className="home-card__subtitle">设备能力</h3>
            <div className="home-caps">
              {capsLoading ? (
                <span className="home-chip">读取中…</span>
              ) : (
                CAPABILITY_KEYS.map((k) => (
                  <span key={k} className={`home-chip home-chip--${capabilities[k] ? 'ok' : 'no'}`}>
                    {CAPABILITY_LABELS[k]} {capabilities[k] ? '✓' : '✗'}
                  </span>
                ))
              )}
            </div>
          </section>

          {/* 接口测试 */}
          <section className="home-card ui-card">
            <div className="home-card__head">
              <h2 className="home-card__title">接口测试</h2>
              <span className="home-summary">下拉可重新测试</span>
            </div>
            {results.map((r) => (
              <div key={r.id} className="home-test">
                <div className="home-test__head">
                  <span className="home-test__label">{r.label}</span>
                  <span className={`home-badge home-badge--${r.status}`}>
                    {r.status === 'pending'
                      ? '测试中'
                      : r.status === 'success'
                        ? '正常'
                        : r.status === 'timeout'
                          ? '超时'
                          : '异常'}
                  </span>
                </div>
                <div className="home-test__detail">
                  {r.status === 'pending'
                    ? '…'
                    : r.status === 'success'
                      ? JSON.stringify(r.data)
                      : `${r.error?.code || ''} ${r.error?.message || ''}`.trim()}
                </div>
              </div>
            ))}
          </section>
        </div>
      </PullToRefresh>
    </div>
  );
}
