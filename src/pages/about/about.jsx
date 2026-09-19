import { useEffect, useState } from 'react';
import './about.css';

/**
 * 关于基座：展示应用 / Bridge 信息与可用设备能力（通用，非业务）。
 */
export default function About() {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.RN) {
      setError('RN 桥接未注入');
      return;
    }
    Promise.all([window.RN.APP.GETINFO(), window.RN.GETCAPABILITIES()])
      .then(([i, caps]) => setInfo({ ...i, capabilities: caps }))
      .catch((e) => setError(`${e?.code || ''} ${e?.message || ''}`.trim()));
  }, []);

  const caps = info?.capabilities || {};
  const capList = Object.keys(caps).filter((k) => caps[k]);

  return (
    <div className="about-page page-container">
      <div className="about-card ui-card">
        <h2 className="about-card__title">关于基座</h2>
        <p className="about-card__desc">
          通用 RN + H5 基座，不承载业务功能，仅持续扩展 RN 设备能力。
        </p>
        {error && <p className="about-card__err">{error}</p>}
        {info && (
          <ul className="about-list">
            <li>
              <span>应用版本</span>
              <span>{info.appVersion ?? '-'}</span>
            </li>
            <li>
              <span>Bridge 版本</span>
              <span>{info.bridgeVersion ?? '-'}</span>
            </li>
            <li>
              <span>平台</span>
              <span>{info.platform ?? '-'}</span>
            </li>
            <li>
              <span>可用能力</span>
              <span>{capList.join('、') || '无'}</span>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
