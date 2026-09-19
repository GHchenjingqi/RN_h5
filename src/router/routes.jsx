import Home from '../pages/home/home';

/**
 * 静态路由表：
 *   /              基座首页（运行环境 + 接口自动化测试，自绘顶部无导航栏）
 *   /devtools      能力测试台（Bridge 连接状态 + 能力矩阵 + 原生事件流，无导航栏）
 *   /about         关于
 *   /test/app      APP 模块测试
 *   /test/system   SYSTEM 模块测试
 *   /test/camera   CAMERA 模块测试
 *   /test/scanner  SCANNER 模块测试
 *   /test/location LOCATION 模块测试
 *   /test/nfc      NFC 模块测试
 *   /test/file     FILE 模块测试
 *   /test/media    MEDIA 模块测试
 *   /test/notification NOTIFICATION 模块测试
 *   /test/auth     AUTH 模块测试
 *   /test/permission PERMISSION 模块测试
 *   /test/log      LOG 模块测试
 *   /test/network  NETWORK 模块测试
 */
const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: '基座首页', hideNavbar: true },
  },
  {
    path: '/devtools',
    name: 'devtools',
    lazy: () => import('../pages/devtools/devtools'),
    meta: { title: '能力测试台', hideNavbar: true },
  },
  {
    path: '/about',
    name: 'about',
    lazy: () => import('../pages/about/about'),
    meta: { title: '关于' },
  },
  // ===== 模块测试页（从能力测试入口进入，hideTabbar 隐藏底部 tab）=====
  {
    path: '/test/app',
    name: 'test-app',
    lazy: () => import('../pages/test/app'),
    meta: { title: 'APP 测试', hideTabbar: true },
  },
  {
    path: '/test/system',
    name: 'test-system',
    lazy: () => import('../pages/test/system'),
    meta: { title: 'SYSTEM 测试', hideTabbar: true },
  },
  {
    path: '/test/camera',
    name: 'test-camera',
    lazy: () => import('../pages/test/camera'),
    meta: { title: 'CAMERA 测试', hideTabbar: true },
  },
  {
    path: '/test/scanner',
    name: 'test-scanner',
    lazy: () => import('../pages/test/scanner'),
    meta: { title: 'SCANNER 测试', hideTabbar: true },
  },
  {
    path: '/test/location',
    name: 'test-location',
    lazy: () => import('../pages/test/location'),
    meta: { title: 'LOCATION 测试', hideTabbar: true },
  },
  {
    path: '/test/nfc',
    name: 'test-nfc',
    lazy: () => import('../pages/test/nfc'),
    meta: { title: 'NFC 测试', hideTabbar: true },
  },
  {
    path: '/test/file',
    name: 'test-file',
    lazy: () => import('../pages/test/file'),
    meta: { title: 'FILE 测试', hideTabbar: true },
  },
  {
    path: '/test/media',
    name: 'test-media',
    lazy: () => import('../pages/test/media'),
    meta: { title: 'MEDIA 测试', hideTabbar: true },
  },
  {
    path: '/test/notification',
    name: 'test-notification',
    lazy: () => import('../pages/test/notification'),
    meta: { title: 'NOTIFICATION 测试', hideTabbar: true },
  },
  {
    path: '/test/auth',
    name: 'test-auth',
    lazy: () => import('../pages/test/auth'),
    meta: { title: 'AUTH 测试', hideTabbar: true },
  },
  {
    path: '/test/permission',
    name: 'test-permission',
    lazy: () => import('../pages/test/permission'),
    meta: { title: 'PERMISSION 测试', hideTabbar: true },
  },
  {
    path: '/test/log',
    name: 'test-log',
    lazy: () => import('../pages/test/log'),
    meta: { title: 'LOG 测试', hideTabbar: true },
  },
  {
    path: '/test/network',
    name: 'test-network',
    lazy: () => import('../pages/test/network'),
    meta: { title: 'NETWORK 测试', hideTabbar: true },
  },
];

export default routes;
