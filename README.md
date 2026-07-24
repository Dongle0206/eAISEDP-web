# eAISEDP Web

eAISEDP 企业级 AI 软件工程平台前端。

## 技术栈

- HTML5 + 原生 JavaScript
- jQuery 3.7.1
- Bootstrap 5.3
- marked.js（Markdown 渲染）

## 项目结构

```
├── login.html              登录页
├── index.html              主框架（侧边栏+顶栏+多Tab）
├── config.js               配置（API 地址，切换环境改这里）
├── pages/                  功能页面
│   ├── case-list.html      Case 列表
│   └── case-detail.html    Case 详情+发起派生
└── assets/
    ├── css/                样式
    │   ├── app.css         定制样式
    │   └── bootstrap.min.css
    └── js/
        ├── jquery-3.7.1.min.js
        ├── bootstrap.bundle.min.js
        ├── api.js           API 封装（自动带 token + 401 跳登录）
        ├── auth.js          登录态管理
        ├── menu.js          角色动态菜单
        ├── i18n.js          国际化预留
        └── lib/
            └── marked.min.js  Markdown 渲染
```

## 部署

### 方式 1：Nginx 静态托管（推荐生产）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/eaiselp-web;
    index login.html;

    location / {
        try_files $uri $uri/ /login.html;
    }
}
```

### 方式 2：直接浏览器打开（开发期）

配置好 `config.js` 的 API 地址后，直接用浏览器访问 `login.html`。

### 方式 3：Docker（可选）

```dockerfile
FROM nginx:alpine
COPY . /usr/share/nginx/html
```

## 配置

编辑 `config.js`，修改 API 地址：

```javascript
window.EAISELP_CONFIG = {
  AUTH_BASE_URL: 'http://your-server:8085',  // 认证服务
  API_BASE_URL: 'http://your-server:8081',   // 业务服务
};
```

## 后端对接

- 后端仓库：[eAISEDP](https://github.com/Dongle0206/eAISEDP)
- API 文档：后端仓 `docs/需求文档/M2-Phase1-PRD.md` §5 API 契约
- CORS：后端已配置允许跨域

## 角色

5 类人类角色，各有不同工作台：

| 角色 | 菜单 |
|---|---|
| platform_admin | 系统管理/租户管理/模型路由/适配器/监控 |
| tenant_admin | 用户管理/角色管理/项目群/标准/配额 |
| project_manager | Case 管理/派生进度/检查点/产物 |
| engineer | 待办审查/Case 详情/产物/任务 |
| executive | 战略看板/投资/风险/里程碑/效能 |
