import TestSection from '../../components/testsection/testsection';
import './test.css';

/** NETWORK 模块测试页 */
export default function TestNetwork() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">NETWORK 网络模块</h1>
      <p className="test-page__subtitle">网络状态 / 类型</p>
      <TestSection title="NETWORK.GETSTATUS" desc="获取当前网络状态" fn={() => window.RN.NETWORK.GETSTATUS()} />
    </div>
  );
}
