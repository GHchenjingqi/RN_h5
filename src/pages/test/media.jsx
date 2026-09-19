import TestSection from '../../components/testsection/testsection';
import './test.css';

/** MEDIA 模块测试页 */
export default function TestMedia() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">MEDIA 媒体模块</h1>
      <p className="test-page__subtitle">选图 / 保存图片到相册</p>
      <TestSection title="MEDIA.PICKIMAGE" desc="从相册选择图片" fn={() => window.RN.MEDIA.PICKIMAGE({ multiple: false })} />
      <TestSection title="MEDIA.SAVEIMAGE" desc="保存图片到相册（需图片 uri）" fn={() => window.RN.MEDIA.SAVEIMAGE({ uri: '' })} />
    </div>
  );
}
