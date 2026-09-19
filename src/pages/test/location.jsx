import TestSection from '../../components/testsection/testsection';
import './test.css';

/** LOCATION 模块测试页 */
export default function TestLocation() {
  return (
    <div className="test-page">
      <h1 className="test-page__title">LOCATION 定位模块</h1>
      <p className="test-page__subtitle">获取当前地理位置（经纬度/精度/时间戳）</p>
      <TestSection title="LOCATION.GETCURRENTPOSITION" desc="获取当前位置，需定位权限" fn={() => window.RN.LOCATION.GETCURRENTPOSITION()} />
    </div>
  );
}
