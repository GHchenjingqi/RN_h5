import TestSection from '../../components/testsection/testsection';
import './test.css';

/** LOG 模块测试页 */
export default function TestLog() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">LOG 日志模块</h1>
      <p className="test-page__subtitle">向原生日志系统写入各级别日志</p>
      <TestSection title="LOG.INFO" desc="写入 info 日志" fn={() => window.RN.LOG.INFO({ tag: 'H5', message: 'test info log' })} />
      <TestSection title="LOG.WARN" desc="写入 warn 日志" fn={() => window.RN.LOG.WARN({ tag: 'H5', message: 'test warn log' })} />
      <TestSection title="LOG.ERROR" desc="写入 error 日志" fn={() => window.RN.LOG.ERROR({ tag: 'H5', message: 'test error log' })} />
      <TestSection title="LOG.DEBUG" desc="写入 debug 日志" fn={() => window.RN.LOG.DEBUG({ tag: 'H5', message: 'test debug log' })} />
    </div>
  );
}
