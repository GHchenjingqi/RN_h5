import { useState } from 'react';
import TestSection from '../../components/testsection/testsection';
import './test.css';

const PERMISSIONS = ['camera', 'location', 'notification', 'storage', 'microphone'];

/** PERMISSION 模块测试页 */
export default function TestPermission() {
  const [perm, setPerm] = useState('camera');

  return (
    <div className="test-page">
      <h1 className="test-page__title">PERMISSION 权限模块</h1>
      <p className="test-page__subtitle">检查 / 请求 / 打开系统设置</p>

      <TestSection title="PERMISSION.CHECK" desc="检查权限状态" fn={(p) => window.RN.PERMISSION.CHECK({ permission: p })} params={perm}>
        <label>权限</label>
        <select value={perm} onChange={(e) => setPerm(e.target.value)}>
          {PERMISSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </TestSection>

      <TestSection title="PERMISSION.REQUEST" desc="请求权限" fn={(p) => window.RN.PERMISSION.REQUEST({ permission: p })} params={perm}>
        <label>权限</label>
        <select value={perm} onChange={(e) => setPerm(e.target.value)}>
          {PERMISSIONS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </TestSection>

      <TestSection title="PERMISSION.OPENSETTINGS" desc="打开应用系统设置页" fn={() => window.RN.PERMISSION.OPENSETTINGS()} />
    </div>
  );
}
