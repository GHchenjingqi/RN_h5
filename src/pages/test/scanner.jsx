import TestSection from '../../components/testsection/testsection';
import './test.css';

/** SCANNER 模块测试页 */
export default function TestScanner() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">SCANNER 扫码模块</h1>
      <p className="test-page__subtitle">调用原生扫码（条形码/二维码）</p>
      <TestSection title="SCANNER.SCAN" desc="打开扫码界面，返回码内容" fn={() => window.RN.SCANNER.SCAN()} />
    </div>
  );
}
