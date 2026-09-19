---
name: subproject-development-constraints
description: Enforce the Jingyi H5 subproject's React, routing, styling, naming, API, and validation conventions. Use for every task that creates, modifies, reviews, or reorganizes code in this repository.
---

# 京益 H5 子项目开发约束

> 本文档为本子项目（`jingyi_h5`）的强制开发规范，所有新增 / 修改代码必须遵守。
> 最后更新：2026-09-02

---

## 一、项目概述

- **定位**：运行于 RN WebView 中的 H5 子应用（hash 路由，`file://` 加载）。
- **设计稿宽度**：375px（移动端标准）。
- **与基座通信**：通过 `window.RN` Bridge（`public/js/api.js` 提供，浏览器环境自动 Mock）。

---

## 二、技术栈

| 类别 | 选型 | 版本 |
|---|---|---|
| 框架 | React | 18.x |
| 构建 | Vite | 5.x |
| 路由 | react-router-dom（hash 模式） | 6.x |
| UI 组件库 | NutUI React | 4.x（beta） |
| 图标 | @nutui/icons-react | 3.x |
| 持久化 | localStorage 封装（`jy_h5:` 命名空间） | — |

---

## 三、目录结构

```
src/
├── api/                # 业务接口定义（若依标准端点，按模块拆分）
│   ├── index.js        #   全局拦截器配置 + 统一出口
│   ├── user.js         #   用户相关（login/logout/getInfo/captchaImage）
│   ├── menu.js         #   菜单 / 动态路由（getRouters）
│   └── tenant.js       #   租户公司列表（getTenantList，登录页公司下拉数据源）
├── components/         # 全局共享组件（无业务耦合）
│   ├── loading/        # 每个组件目录与 JSX/CSS 同名配对
│   │   ├── loading.jsx
│   │   └── loading.css
│   └── pageheader/
│       ├── pageheader.jsx
│       └── pageheader.css
├── layouts/            # 布局组件（同样按目录配对）
│   └── basiclayout/
│       ├── basiclayout.jsx
│       └── basiclayout.css
├── mock/               # 模拟数据（无后端时使用，与真实 API 接口签名一致）
│   ├── index.js
│   ├── request.js
│   ├── user.js
│   ├── company.js
│   └── routes.js
├── pages/              # 页面组件（每个页面目录包含同名 JSX/CSS）
│   └── home/
│       ├── home.jsx
│       └── home.css
├── router/             # 路由配置与动态路由注册中心
│   ├── routes.jsx      #   静态路由配置表
│   ├── routeStore.js   #   动态路由注册 / 移除
│   └── AppRouter.jsx   #   路由渲染入口
├── utils/              # 工具函数
│   ├── flexible.js     #   rem 适配脚本（必须在应用渲染前引入）
│   ├── request.js      #   统一 API 请求封装（fetch + 拦截器）
│   ├── storage.js      #   持久化存储封装
│   └── usePersistState.js  # 持久化 state Hook
├── App.jsx             # 根组件（HashRouter 包裹）
└── main.jsx            # 入口（引入 flexible + NutUI 样式 + 挂载 App）
```

---

## 四、样式规范（强制）

### 4.1 禁止使用 px 物理像素

> **【强制】项目中所有样式代码禁止出现 `px` 物理像素单位，统一使用 `rem` 相对单位。**

- 适配方案：`src/utils/flexible.js`，设计稿 375px，**1rem = 100px**。
- 换算公式：`rem = px / 100`。
- 示例：

  | 设计稿 px | 代码 rem |
  |---|---|
  | 16px | `0.16rem` |
  | 24px | `0.24rem` |
  | 52px | `0.52rem` |
  | 375px（满屏宽） | `3.75rem` |

- 内联样式（React `style={{}}`）中的数字值也必须写为 rem 字符串：
  ```jsx
  // ✅ 正确
  <div style={{ padding: '0.16rem', fontSize: '0.14rem' }} />

  // ❌ 错误（数字会被 React 当作 px）
  <div style={{ padding: 16, fontSize: 14 }} />
  ```

- 允许的例外：
  - `0`（零值无需单位）；
  - `vh` / `vw` / `%` / `em` 等其他相对单位；
  - `fontWeight`（字重数字，如 `700`）；
  - `z-index` / `opacity` / `line-height` 等无单位属性；
  - 注释中说明换算关系时可提及 px。

- 1px 边框等精细场景：使用 `0.01rem`（在 375px 设计稿下等于 1px），禁止写 `1px`。

### 4.2 flexible.js 引入要求

- `src/utils/flexible.js` 必须在 `main.jsx` 中**最先引入**（在 NutUI 样式和 App 组件之前），确保根字体大小在首次渲染前已设置。
- 禁止在其他文件中重复引入 flexible.js。
- 禁止手动修改 `document.documentElement.style.fontSize`。

### 4.3 样式书写规范

- 优先使用 NutUI 组件自带样式，避免重复造轮子。
- 页面和组件的静态样式必须抽离到同目录同名 CSS 文件，禁止在 JSX 中维护大段 style 对象。
- 页面目录使用小写、语义化名称：`src/pages/home/home.jsx` + `src/pages/home/home.css`。
- 共享组件目录也使用小写名称，并将 `loading.jsx` 与 `loading.css` 放在 `loading/` 目录中。
- 可复用的基础规则（搜索框、胶囊筛选、卡片、空状态等）放入 `src/assets/css/main.css`；页面特有规则留在页面 CSS。
- JSX 中只保留运行时动态值（例如 CSS 变量、第三方组件兼容性 style API）；动态状态优先通过条件 class 表达。
- 颜色值使用十六进制（如 `#2b7de9`），不使用颜色名。

---

## 五、路由规范

### 5.1 静态路由

- 所有静态路由在 `src/router/routes.jsx` 中集中配置。
- 路由配置项支持：`path` / `name` / `component` / `lazy` / `redirect` / `meta` / `children`。
- 页面级组件优先使用 `lazy` 懒加载（代码分割）。
- `meta.title` 用于设置文档标题；`meta.hideTabbar: true` 用于隐藏底部导航（如登录页）。

### 5.2 动态路由

- 通过 `src/router/routeStore.js` 的 `registerRoute(route, {prepend})` / `registerRoutes` / `removeRoute(name|path)` / `hasRoute` 管理。
- 动态路由通常在登录成功后根据用户权限拉取并注册。
- 移除路由后立即生效，访问该路径落入 404。

### 5.3 路由模式

- 固定使用 **hash 模式**（`createHashRouter`），因子应用以 `file://` 加载入 RN WebView，不支持 history 模式。
- 禁止切换为 history 模式。

---

## 六、持久化存储规范

- 统一使用 `src/utils/storage.js` 的 `createStorage(namespace)` 创建命名空间存储。
- 所有存储 key 自动加 `jy_h5:` 前缀，避免与基座 / 其他子应用冲突。
- 自动 JSON 序列化 / 反序列化；localStorage 不可用时自动降级为内存存储。
- 组件内需要持久化的 state 使用 `usePersistState(key, initialValue)` Hook。
- 禁止直接使用 `localStorage.setItem / getItem`（token 等全局场景除外，且必须加 `jy_h5:` 前缀）。

---

## 七、API 请求规范（若依 RuoYi 框架）

### 7.1 后端地址与环境变量

- 后端框架：**若依 RuoYi**（Spring Boot，前后端分离）。
- 后端地址：`http://192.168.2.41:8080`（与 PC 项目同一后端）。
- 环境变量文件：
  - `.env.development`：开发环境，`VITE_API_BASE_URL = '/api'`（走 Vite 代理），`VITE_RUOYI_TARGET = 'http://192.168.2.41:8080'`。
  - `.env.production`：生产环境，`VITE_API_BASE_URL = 'http://192.168.2.41:8080'`（RN WebView 内直接访问）。
- 所有环境变量必须以 `VITE_` 前缀才能暴露给客户端代码。
- Mock 开关：`VITE_USE_MOCK = 'true'` 时登录页走 mock 数据，否则请求真实后端。

### 7.2 开发环境代理

- `vite.config.js` 中配置 `server.proxy`：`/api` 前缀的请求转发到 `VITE_RUOYI_TARGET`，并去掉 `/api` 前缀。
- 示例：`/api/login` → `http://192.168.2.41:8080/login`。
- 代理仅用于开发环境（避免跨域），生产环境使用绝对地址直连。

### 7.3 请求封装

- 统一使用 `src/utils/request.js`（基于 fetch，API 风格对齐 axios）。
- 支持请求拦截器 / 响应拦截器 / baseURL / timeout / 快捷方法（get/post/put/delete/patch）。
- 禁止直接使用 `fetch` / `XMLHttpRequest` 发请求。

### 7.4 若依响应格式与拦截器

- **若依标准响应格式**：`{ code: 200, msg: "操作成功", ... }`
  - 成功：`code === 200`，返回完整响应体（`token` / `data` / `user` 等字段由调用方提取）。
  - 失败：`code !== 200`，Toast 提示 `msg` 并 reject。
  - `code === 401`：清除 token（`jy_h5:token`）并跳转登录页。
- **请求拦截器**：统一注入 `Authorization: Bearer <token>`（token 从 `localStorage.getItem('jy_h5:token')` 读取）。
- **响应拦截器**在 `src/api/index.js` 中配置，禁止在页面中重复处理通用错误。
- **静默请求**：请求配置中传 `{ skipErrorToast: true }` 可跳过响应拦截器的错误 Toast（适用于有兜底逻辑的非关键请求，如租户列表）。
- **跳过鉴权处理**：请求配置中传 `{ skipAuthHandler: true }` 可跳过 401 时的清 token / 跳登录页逻辑，直接返回响应体由调用方判断 code（适用于登录页等无 token 场景，如租户列表接口后端未白名单时返回 401，前端静默走 mock 兜底）。
- **跨域配置**：请求封装默认 `credentials: 'same-origin'`（跨域不带 cookie），token 通过 Authorization 头传递；GET/HEAD 请求自动移除 `Content-Type` 头，避免触发不必要的 CORS 预检。

### 7.5 若依标准端点

| 端点 | 方法 | 说明 | 响应关键字段 |
|---|---|---|---|
| `/prod-api/auth/tenant/list` | GET | 获取租户公司列表（登录页进入时先调） | `data.voList`（`tenantId`/`companyName`/`domain`） |
| `/captchaImage` | GET | 获取验证码图片 | `img`(base64), `uuid` |
| `/login` | POST | 登录 | `token` |
| `/logout` | POST | 退出登录 | — |
| `/getInfo` | GET | 获取用户信息、角色、权限 | `permissions`, `roles`, `user` |
| `/getRouters` | GET | 获取动态路由（菜单树） | `data`(路由数组) |

- 租户列表接口（`/prod-api/auth/tenant/list`）为若依-Cloud 多租户端点，带 `/prod-api` 前缀；其余端点为若依标准端点（无前缀，由网关统一路由）。
- **后端配置要求**：租户列表接口需在若依网关白名单中放行（无需 token）。若后端未配置白名单，登录页无 token 时会返回 `code: 401 "未能读取到有效 token"`；前端已通过 `skipAuthHandler` 静默处理并走 mock 兜底，但建议后端配置白名单以获取真实租户数据。
- 登录页进入时先调租户列表，用返回的 `voList` 渲染公司下拉；接口失败时静默兜底 `mockCompanyList`，不弹错误提示。

- 登录请求体：`{ username, password, code?, uuid? }`（`code`/`uuid` 为验证码，当前页面未集成验证码时可不传）。
- 业务接口按模块定义在 `src/api/` 目录下（`user.js` / `menu.js`），统一从 `src/api/index.js` 导出。
- 接口函数必须有 JSDoc 注释（参数、返回值说明）。

### 7.6 Token 存储

- Token 存储在 `localStorage`，key 为 `jy_h5:token`（遵循项目命名空间规范）。
- 登录成功后写入：`localStorage.setItem('jy_h5:token', res.token)`。
- 退出登录或 401 时清除：`localStorage.removeItem('jy_h5:token')`。

### 7.7 Mock 数据

- 无后端时使用 `src/mock/` 下的模拟数据，接口签名必须与若依真实 API 一致。
- `src/mock/request.js` 提供 `mockRequest(data, delay)` 模拟异步延迟。
- 登录页通过 `VITE_USE_MOCK` 环境变量切换 mock / 真实后端，无需修改代码。

---

## 八、组件开发规范

### 8.1 页面组件（`src/pages/`）

- 一个页面对应一个小写目录，目录内必须有同名 `.jsx` 和 `.css` 文件（如 `src/pages/login/login.jsx`、`src/pages/login/login.css`）。
- 页面组件默认导出。
- 页面顶部必须有 JSDoc 注释说明页面用途。
- 页面内样式使用 rem（见第四章）。

### 8.2 共享组件（`src/components/`）

- 无业务耦合、可在多个页面复用的组件放入此目录。
- 组件必须有 JSDoc 注释（用途、props、用法示例）。
- Props 必须语义化，避免传递整个路由对象或全局状态。

### 8.3 NutUI 组件使用

- 优先使用 NutUI 提供的组件（Button / Input / Cell / Toast 等）。
- NutUI v4 为 beta 版，部分组件可能存在 bug；遇到问题优先排查组件源码，必要时用原生元素替代（如登录页公司下拉使用原生 `<select>` 替代 NutUI Picker）。
- 图标使用 `@nutui/icons-react`，props 为 `width` / `height` / `color` / `style`（无 `size` prop），尺寸使用 rem 字符串。

---

## 九、代码规范

- **语言**：JavaScript（JSX），暂不引入 TypeScript。
- **缩进**：2 空格。
- **引号**：单引号。
- **分号**：语句末尾必须加分号。
- **导入顺序**：第三方库 → 项目内部模块（按目录层级从外到内）。
- **命名**：
  - 组件 / 类：PascalCase；
  - 函数 / 变量：camelCase；
  - 常量：UPPER_SNAKE_CASE；
  - 页面/组件目录和配对文件使用 lowercase；工具函数用 camelCase。
- **注释**：
  - 每个文件顶部必须有 JSDoc 说明用途；
  - 复杂逻辑必须有行内注释；
  - 禁止无意义注释（如 `// 设置值为 1`）。
- **禁止**：
  - 提交 `console.log` 调试代码（`console.error` 用于错误捕获除外）；
  - 硬编码业务常量（应提取为配置或常量）；
  - 修改 `node_modules` 下的文件。

---

## 十、构建与部署

- 开发：`npm run dev`（Vite 开发服务器，端口 5173，`/api` 代理到若依后端）。
- 构建：`npm run build`（产物输出到 `dist/`）。
- 预览：`npm run preview`。
- 环境变量：`.env.development`（开发）/ `.env.production`（生产），修改后端地址只需改 `VITE_RUOYI_TARGET` / `VITE_API_BASE_URL`。
- `vite.config.js` 中 `base: './'`（相对路径，适配 `file://` 加载），禁止修改为绝对路径。
- 构建产物由 RN 基座打包，禁止在子项目中配置部署相关逻辑。

---

## 十一、Bridge API（api.js）同步规范

### 11.1 唯一源文件

- `public/js/api.js` **不是**子项目独立维护的文件，而是从 RN 基座子应用模板同步而来。
- **唯一源文件**：`jingyi_app_base/h5-subapp-setup/scripts/api.js`（基座项目内，子应用模板的 Bridge API 源）。
- 子项目的 `public/js/api.js` 由基座同步脚本覆盖拷贝，**禁止直接修改子项目中的 api.js**。
- 基座 `h5/` 目录下的 api.js（基座内置 H5 页面用）不在同步范围内，独立维护。

### 11.2 修改流程

1. 修改基座项目的 `jingyi_app_base/h5/js/api.js`（唯一源）。
2. 在基座项目根目录运行同步脚本：
   ```bash
   npm run sync:api
   ```
3. 脚本会自动将源文件覆盖拷贝到所有目标位置（含本子项目的 `public/js/api.js`）。
4. 同步脚本支持内容对比，内容一致的目标自动跳过。

### 11.3 同步目标清单

| 目标路径 | 说明 |
|---|---|
| `jingyi_app_base/h5-subapp-setup/assets/react-template/public/js/api.js` | React 子应用模板 |
| `jingyi_app_base/h5-subapp-setup/assets/vue-template/public/js/api.js` | Vue 子应用模板 |
| `jingyi_h5/public/js/api.js` | 当前 H5 子项目 |

> 注：基座 `h5/js/api.js` 和 `h5/back/js/api.js` 是基座内置 H5 页面用的，不在同步范围内。

### 11.4 新建子项目时

- 新建 H5 子项目时，直接从基座模板（`h5-subapp-setup/assets/react-template/` 或 `vue-template/`）拷贝，模板中的 `public/js/api.js` 已包含最新 Bridge API。
- 后续 api.js 有更新时，在基座运行 `npm run sync:api` 即可同步到所有子项目。

---

## 附录：rem 换算速查表

| px | rem | px | rem | px | rem |
|---|---|---|---|---|---|
| 1 | 0.01 | 12 | 0.12 | 32 | 0.32 |
| 2 | 0.02 | 14 | 0.14 | 36 | 0.36 |
| 4 | 0.04 | 16 | 0.16 | 40 | 0.40 |
| 6 | 0.06 | 18 | 0.18 | 48 | 0.48 |
| 8 | 0.08 | 20 | 0.20 | 52 | 0.52 |
| 10 | 0.10 | 24 | 0.24 | 64 | 0.64 |
