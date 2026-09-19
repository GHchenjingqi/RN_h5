import { useState } from 'react';
import TestSection from '../../components/testsection/testsection';
import './test.css';

/** SYSTEM 模块测试页 */
export default function TestSystem() {
  const [copyText, setCopyText] = useState('Hello from H5!');
  const [shareText, setShareText] = useState('分享内容测试');
  const [shareUrl, setShareUrl] = useState('https://example.com');

  return (
    <div className="test-page">
      <h1 className="test-page__title">SYSTEM 系统模块</h1>
      <p className="test-page__subtitle">系统信息 / 剪贴板 / 分享 / 震动</p>

      <TestSection title="SYSTEM.VIBRATE" desc="震动 200ms" fn={() => window.RN.SYSTEM.VIBRATE({ duration: 200 })} />

      <TestSection title="SYSTEM.COPY" desc="复制文本到剪贴板" fn={(text) => window.RN.SYSTEM.COPY({ text })} params={copyText}>
        <label>文本</label>
        <input value={copyText} onChange={(e) => setCopyText(e.target.value)} />
      </TestSection>

      <TestSection
        title="SYSTEM.SHARE"
        desc="调用系统分享"
        fn={() => window.RN.SYSTEM.SHARE({ title: '分享', text: shareText, url: shareUrl })}
      >
        <label>内容</label>
        <input value={shareText} onChange={(e) => setShareText(e.target.value)} />
        <label>URL</label>
        <input value={shareUrl} onChange={(e) => setShareUrl(e.target.value)} />
      </TestSection>

      <TestSection title="SYSTEM.GETDARKMODE" desc="当前深色模式" fn={() => window.RN.SYSTEM.GETDARKMODE()} />
      <TestSection title="SYSTEM.GETLANGUAGE" desc="系统语言" fn={() => window.RN.SYSTEM.GETLANGUAGE()} />
      <TestSection title="SYSTEM.GETSCREENINFO" desc="屏幕信息" fn={() => window.RN.SYSTEM.GETSCREENINFO()} />
      <TestSection title="SYSTEM.GETSTATUSBARHEIGHT" desc="状态栏高度" fn={() => window.RN.SYSTEM.GETSTATUSBARHEIGHT()} />
      <TestSection title="SYSTEM.GETPLATFORM" desc="运行平台" fn={() => window.RN.SYSTEM.GETPLATFORM()} />
      <TestSection title="SYSTEM.GETINFO" desc="汇总系统信息" fn={() => window.RN.SYSTEM.GETINFO()} />
      <TestSection title="SYSTEM.GETDEVICEINFO" desc="设备信息" fn={() => window.RN.SYSTEM.GETDEVICEINFO()} />
      <TestSection title="SYSTEM.GETBATTERY" desc="电量与充电状态" fn={() => window.RN.SYSTEM.GETBATTERY()} />
    </div>
  );
}
