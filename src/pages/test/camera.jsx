import TestSection from '../../components/testsection/testsection';
import './test.css';

/** CAMERA 模块测试页 */
export default function TestCamera() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">CAMERA 相机模块</h1>
      <p className="test-page__subtitle">调用原生相机拍照</p>
      <TestSection title="CAMERA.TAKEPHOTO" desc="打开相机拍照，返回图片 uri" fn={() => window.RN.CAMERA.TAKEPHOTO()} />
    </div>
  );
}
