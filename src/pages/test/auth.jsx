import TestSection from '../../components/testsection/testsection';
import './test.css';

/** AUTH 模块测试页 */
export default function TestAuth() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">AUTH 鉴权模块</h1>
      <p className="test-page__subtitle">登录 Token / 用户信息 / 登出</p>
      <TestSection title="AUTH.GETTOKEN" desc="获取登录 Token" fn={() => window.RN.AUTH.GETTOKEN()} />
      <TestSection title="AUTH.GETUSER" desc="获取当前用户信息" fn={() => window.RN.AUTH.GETUSER()} />
      <TestSection title="AUTH.LOGOUT" desc="退出登录" fn={() => window.RN.AUTH.LOGOUT()} />
    </div>
  );
}
