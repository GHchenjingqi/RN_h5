import { Link } from 'react-router-dom';
import { Button, Empty } from '@nutui/nutui-react';
import './notfound.css';
import emptyImg from '../../assets/imgs/empty.png';

/** 404 兜底页：未匹配到任何路由时展示。 */
export default function NotFound() {
  return (
    <div className="not-found-page">
      <Empty description="页面不存在，无法找到！"  image={emptyImg} />
      <div className="not-found-page__actions">
        <Link to="/">
          <Button size="small" type="primary">
            返回首页
          </Button>
        </Link>
      </div>
    </div>
  );
}
