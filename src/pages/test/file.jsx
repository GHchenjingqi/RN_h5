import TestSection from '../../components/testsection/testsection';
import './test.css';

/** FILE 模块测试页 */
export default function TestFile() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">FILE 文件模块</h1>
      <p className="test-page__subtitle">文件选择 / 读取 / 下载 / 打开</p>
      <TestSection title="FILE.PICK" desc="选择文件" fn={() => window.RN.FILE.PICK({ multiple: false })} />
      <TestSection title="FILE.PICKIMAGE" desc="从相册选图" fn={() => window.RN.FILE.PICKIMAGE({ multiple: false })} />
      <TestSection title="FILE.DOWNLOAD" desc="下载文件到缓存" fn={() => window.RN.FILE.DOWNLOAD({ url: 'https://example.com/test.txt' })} />
    </div>
  );
}
