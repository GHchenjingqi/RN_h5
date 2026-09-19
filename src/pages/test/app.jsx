import TestSection from '../../components/testsection/testsection';
import { H5_VERSION } from '../../utils/bridge';
import './test.css';

/** APP 模块测试页 */
export default function TestApp() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">APP 应用模块</h1>
      <p className="test-page__subtitle">应用信息 / 版本 / 能力清单 / 握手</p>
      <TestSection title="APP.GETINFO" desc="获取应用信息" fn={() => window.RN.APP.GETINFO()} />
      <TestSection title="APP.GETVERSION" desc="获取应用版本" fn={() => window.RN.APP.GETVERSION()} />
      <TestSection title="APP.GETCAPABILITIES" desc="获取设备能力清单" fn={() => window.RN.APP.GETCAPABILITIES()} />
      <TestSection title="APP.READY" desc="握手通知" fn={() => window.RN.APP.READY({ h5Version: H5_VERSION })} />
    </div>
  );
}
