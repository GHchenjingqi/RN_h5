import { useState } from 'react';
import TestSection from '../../components/testsection/testsection';
import './test.css';

/** NOTIFICATION 模块测试页 */
export default function TestNotification() {
  const [title, setTitle] = useState('测试通知');
  const [content, setContent] = useState('这是一条来自 H5 的测试通知');
  const [badge, setBadge] = useState('3');

  return (
    <div className="test-page">
      <h1 className="test-page__title">NOTIFICATION 通知模块</h1>
      <p className="test-page__subtitle">推送 Token / 角标 / 提示音 / 通知栏消息</p>

      <TestSection title="NOTIFICATION.GETTOKEN" desc="获取推送注册 Token" fn={() => window.RN.NOTIFICATION.GETTOKEN()} />

      <TestSection title="NOTIFICATION.SETBADGE" desc="设置桌面角标数字" fn={(count) => window.RN.NOTIFICATION.SETBADGE({ count: Number(count) })} params={badge}>
        <label>角标数字</label>
        <input value={badge} onChange={(e) => setBadge(e.target.value)} />
      </TestSection>

      <TestSection title="NOTIFICATION.PLAYSOUND" desc="播放系统提示音" fn={() => window.RN.NOTIFICATION.PLAYSOUND()} />

      <TestSection
        title="NOTIFICATION.SENDNOTIFICATION"
        desc="发送通知栏消息"
        fn={() => window.RN.NOTIFICATION.SENDNOTIFICATION({ title, content })}
      >
        <label>标题</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
        <label>内容</label>
        <input value={content} onChange={(e) => setContent(e.target.value)} />
      </TestSection>
    </div>
  );
}
