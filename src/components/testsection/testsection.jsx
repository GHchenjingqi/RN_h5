import { useState } from 'react';
import QButton from '../qbutton/qbutton';

/**
 * 通用能力测试项组件：标题 + 描述 + 调用按钮 + 结果展示（状态/耗时/返回数据或错误）。
 * 用于各模块测试页的统一交互样式。
 */
export default function TestSection({ title, desc, fn, params, children }) {
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);

  const run = async () => {
    setStatus('loading');
    setResult(null);
    setError(null);
    const start = Date.now();
    try {
      if (!window.RN) {
        throw { code: 'BRIDGE_NOT_INJECTED', message: 'window.RN 未注入，请在基座 App 内打开' };
      }
      const res = await fn(params);
      setResult(res);
      setStatus('success');
    } catch (e) {
      setError(e);
      setStatus('error');
    } finally {
      setDuration(Date.now() - start);
    }
  };

  const statusText = {
    idle: '待调用',
    loading: '调用中',
    success: '成功',
    error: '失败',
  }[status];

  const statusClass = `test-section__badge--${status}`;

  return (
    <div className="test-section ui-card">
      <div className="test-section__head">
        <div>
          <h3 className="test-section__title">{title}</h3>
          {desc && <p className="test-section__desc">{desc}</p>}
        </div>
        <span className={`test-section__badge ${statusClass}`}>{statusText}</span>
      </div>

      {children && <div className="test-section__params">{children}</div>}

      <div className="test-section__action">
        <QButton type="confirm" loading={status === 'loading'} onClick={run} trackId={`test_${title}`}>
          调用
        </QButton>
      </div>

      {(status === 'success' || status === 'error') && (
        <div className={`test-section__result test-section__result--${status}`}>
          <div className="test-section__result-meta">
            {status === 'error' && <span className="test-section__code">{error?.code || 'UNKNOWN_ERROR'}</span>}
            <span className="test-section__duration">耗时 {duration}ms</span>
          </div>
          <div className="test-section__result-body">
            {status === 'error'
              ? error?.message || String(error)
              : result === null || result === undefined
                ? '调用成功，无返回数据'
                : typeof result === 'object'
                  ? JSON.stringify(result, null, 2)
                  : String(result)}
          </div>
        </div>
      )}
    </div>
  );
}
