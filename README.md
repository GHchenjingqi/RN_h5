# base_h5（H5 子应用）

通用 RN + H5 基座的 H5 端：React + Vite 单文件子包，作为 RN 基座 App 内嵌 WebView 的子包运行，也可在浏览器中脱离 App 调试。

> 本项目为**通用基座**，不承载任何业务功能。仅保留与 RN 基座的 Bridge 通信能力 + 一个设备能力调试台（devtools），供后续扩展 RN 基座设备能力时验证。

## 配套仓库（两仓配合使用）

| 仓库 | 角色 | 与本仓的关系 |
|---|---|---|
| [RNbase](https://github.com/GHchenjingqi/RNbase) | RN 基座 / Native Container | 承载本应用的 WebView，提供全部原生能力 |
| **RN_h5**（本仓库） | 基座的**能力测试子应用** | `npm run build:base` 把 `dist/` 同步到基座 `h5/`，再由基座打进 APK assets |

约束与契约：

- 本应用不直接调任何原生 API，全部经 `window.RN` 中间件；`public/js/api.js` 的唯一真源是基座
  `scripts/api.js`，两边 **md5 必须一致**（`npm run sync:api` 拉取，`npm run build` 会自动注入产物）。
- 注入与品牌下发都按「基座是本工程的同级目录 `app_base`」定位；基座克隆成了别的目录名
  （如 `RNbase`）时，用 `BASE_DIR=<基座路径>` 覆盖，例如
  `BASE_DIR=../RNbase npm run build`。基座缺失时脚本会明确报错，不会静默产出旧协议。
- 单独克隆本仓库只能跑 `npm run dev`（浏览器 Mock，结果不代表真机）；
  要出真机包必须同时有基座仓库。

## 技术栈

- **框架**：React 18 + Vite 5
- **路由**：react-router-dom v6（**hash 模式**，子包以 `file://` 加载时无服务器 rewrite，browser 模式会白屏）
- **UI 组件库**：NutUI React v4（`@nutui/nutui-react`）
- **原生桥接**：`window.RN` Bridge 中间件（`public/js/api.js`，浏览器环境自动降级为 Mock）

## 目录结构

```
base_h5/
├── index.html                # 入口 HTML（注入 __H5_APP_ID__ + 相对路径引入 Bridge api.js）
├── app.config.json           # 子应用品牌与版本真源（appName/applicationId/versionName…）
├── app-brand/
│   ├── icon.png              # 图标主图（1024×1024，品牌资源的唯一来源）
│   └── android/              # 由基座 brand:gen 生成的五密度图标/闪屏（构建产物，勿手改）
├── package.json
├── vite.config.js            # base:'./' 保证 file:// 可加载；IIFE 单文件产物；注入 __H5_VERSION__
├── public/
│   └── js/
│       └── api.js            # RN Bridge 中间件（window.RN），通信核心（由基座同步）
├── scripts/
│   ├── sync-to-base.js       # 构建产物同步到 RN 基座 h5/ 目录
│   ├── inject-api.js         # 薄壳：委托基座 inject-h5-api.js 覆盖 api.js（支持 BASE_DIR）
│   └── apply-app-meta.js     # 委托基座 scripts/apply-app-meta.js 下发品牌与版本
└── src/
    ├── main.jsx              # 应用入口：rem 适配 + NutUI 样式 + 状态栏高度 + 启动握手
    ├── App.jsx               # 根组件：HashRouter + 路由渲染入口
    ├── router/               # 路由：静态配置表 + 动态注册中心
    │   ├── routes.jsx        #   静态路由（首页 + 能力测试台 + 13 个模块测试页）
    │   ├── routeStore.js     #   动态路由注册中心（运行期增删）
    │   └── AppRouter.jsx     #   路由渲染入口
    ├── layouts/basiclayout/  # 基础布局（导航栏 + 内容区 + 底部 Tabbar，按 meta.hideNavbar / hideTabbar 隐藏）
    ├── pages/
    │   ├── home/             # 基座首页：运行环境 + 14 项接口自动化测试
    │   ├── devtools/         # 能力测试台：Bridge 连接状态 + 能力矩阵 + 原生事件流
    │   ├── test/             # 各模块逐个方法的测试页（/test/app、/test/system …）
    │   └── notfound/         # 404
    ├── components/           # 通用组件（Q 前缀）：loading / qnavbar / qbutton / testsection
    ├── utils/               # 通用工具：bridge(握手/探测/事件) / flexible(rem) / statusBar / storage / usePersistState / commonfun
    └── assets/              # 全局样式 + empty 图
```

## 快速开始

```bash
npm install
npm run dev          # 浏览器调试（window.RN 自动 Mock）
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
```

## 构建与同步到基座

子包构建产物需同步到 RN 基座的 h5 目录（`../app_base/h5`）：

```bash
npm run build:base   # 构建 + 注入基座 api.js + 同步到基座 h5/
npm run sync:base    # 仅同步（需先 build）
npm run sync:api     # 仅刷新开发期模板 public/js/api.js（与基座协议对齐）
```

## 原生能力调用

入口 `main.jsx` 已自动发起握手（`src/utils/bridge.js` 的 `handshake()`）。基座只在收到
`app.ready` 后才 flush 请求队列，**不要**删掉这行，否则除 `RN.READY` 外的调用都会排队到超时。

页面通过 `window.RN` 调用基座设备能力（浏览器环境自动 Mock）：

```js
window.RN.APP.GETINFO();                 // 应用信息
window.RN.SYSTEM.GETSCREENINFO();        // 屏幕信息
window.RN.CAMERA.TAKEPHOTO();            // 拍照
window.RN.GETCAPABILITIES();             // 能力清单（SDK 内有缓存）
window.RN.APP.GETCAPABILITIES();         // 同上，直连基座（用于刷新探测）
window.RN.ON('app.resume', handler);     // 订阅基座事件，返回取消函数
```

`h5Version` 由 `app.config.json` 的 `versionName` 构建期注入（`__H5_VERSION__`），
`appId` 由 `index.html` 注入（`window.__H5_APP_ID__ = 'app_h5'`），不要在页面里写死。

## 首页与能力测试台（`/`、`/devtools`）

两个 Tab 根页配置了 `meta.hideNavbar`，**不渲染顶部导航栏**，改用全局 `.page-hero` 自绘通栏头部
（渐变色 + 标题 + Bridge 状态药丸 `.q-status`）。状态栏避让由 `.page-hero` 的
`padding-top: calc(0.22rem + var(--status-bar-height))` 负责——新增无导航栏页面时套用同类
hero 结构，不要让内容直接顶到状态栏。子页（`/about`、`/test/*`）仍使用 QNavbar。

能力测试台三块区域，数据全部来自一次 `app.getCapabilities` 探测 + 状态机轮询：

- **能力矩阵**：13 个模块入口。标签含义——
  支持（能力位为 true）/ 不支持（能力位为 false，多为设备或权限限制）/
  未接入原生（基座未上报该能力位）/ 未就绪（核心模块但尚未握手）。
- **Bridge 连接**：状态灯（disconnected/connecting/connected/ready）、排队长度、
  环境与 Bridge/SDK/协议/H5 版本、AppId；「重新握手」按钮幂等重发 `RN.READY`。
- **原生事件流**：监听 `bridge.ready`、`app.resume`、`app.background`、
  `system.darkmodechange`、`keyboard.didShow/DidHide` 等，最近 30 条，用于确认基座推送是否到位。

浏览器里打开时顶部会标注「浏览器 Mock 环境 · 结果不代表真机」。

协议与调用范式详见 `public/js/api.js` 头部注释与基座 `DEVICE_CAPABILITIES.md`。

## 图标与闪屏

品牌资源由本应用持有，主图是 `app-brand/icon.png`（1024×1024，蓝色渐变圆角方块 + 白色 `⟨ • ⟩`）：

```bash
cd ../app_base
npm run brand:gen -- --src ../app_h5/app-brand/icon.png --out ../app_h5/app-brand/android \
  --inset 0.085 --radius 0.22      # 五密度 ic_launcher / ic_launcher_round / splash_logo
npm run brand:apply -- --app app_h5 # 下发到基座 res/（切换活动 App 用 app:use）
```

`--inset 0.085` 是按比例裁掉主图四周的白边与右下角水印，改主图后需重新确认裁切比例
（生成后 Read 一张输出图检查）。应用显示名、包名、闪屏底色见 `app.config.json`。

## 持久化存储

`src/utils/storage.js` 提供命名空间化 localStorage 封装（前缀 `base_h5:`）：

```js
import { setItem, getItem, createStorage } from '../utils/storage';
setItem('key', 'value');              // 实际 key：base_h5:key
const s = createStorage('settings');  // 前缀 base_h5:settings:
s.set('theme', 'dark');
```

> localStorage 不可用时自动降级为内存存储。

## 通信核心

`public/js/api.js` 是与 RN 基座通信的唯一中间件（`window.RN`），由 RN 基座 `scripts/api.js` 作为唯一源维护，通过 `sync:api` / `inject-h5-api.js` 同步到本子包。修改协议时改基座源文件后同步，勿在此处直接改。
