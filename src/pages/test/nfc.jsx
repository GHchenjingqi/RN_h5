import { useState } from 'react';
import TestSection from '../../components/testsection/testsection';
import './test.css';

/** NFC 模块测试页 */
export default function TestNfc() {
  const [writeText, setWriteText] = useState('Hello NFC from qux');
  const [writeType, setWriteType] = useState('text');

  return (
    <div className="test-page">
      <h1 className="test-page__title">NFC 近场通信模块</h1>
      <p className="test-page__subtitle">NFC 可用性检测 / 读取标签 / 写入 NDEF</p>

      <TestSection
        title="NFC.AVAILABLE"
        desc="检测设备 NFC 是否可用（硬件+已开启）"
        fn={() => window.RN.NFC.AVAILABLE()}
      />

      <TestSection
        title="NFC.READTAG"
        desc="读取 NFC 标签（30秒超时，需将标签贴近手机背面）"
        fn={() => window.RN.NFC.READTAG({ timeout: 30000 })}
      />

      <TestSection
        title="NFC.WRITENDEF"
        desc="写入 NDEF 数据到 NFC 标签"
        fn={() => window.RN.NFC.WRITENDEF({ records: [{ type: writeType, data: writeText }] })}
      >
        <label>类型</label>
        <select value={writeType} onChange={(e) => setWriteType(e.target.value)}>
          <option value="text">文本 (text)</option>
          <option value="uri">链接 (uri)</option>
          <option value="mime">MIME (mime)</option>
        </select>
        <label>数据</label>
        <input value={writeText} onChange={(e) => setWriteText(e.target.value)} />
      </TestSection>
    </div>
  );
}
