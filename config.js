/**
 * eAISEDP 前端配置
 *
 * 切换部署环境只改本文件（或用环境变量覆盖）。
 *
 * 双 base-url（auth 独立 service）：
 *   - AUTH_BASE_URL=8085：login / current / logout（auth 服务）
 *   - API_BASE_URL=8081：业务 API（runtime 服务）
 *
 * 部署时改为实际服务器地址，如：
 *   AUTH_BASE_URL: 'http://172.16.180.166:8085'
 *   API_BASE_URL: 'http://172.16.180.166:8081'
 *
 * M3 gateway 落地后改为单入口 gateway:8000。
 */
window.EAISELP_CONFIG = {
  // 认证服务（auth 独立进程）—— login / current / logout
  AUTH_BASE_URL: 'http://172.16.180.166:8085',
  // 业务服务（runtime 主机）—— 业务 API
  API_BASE_URL: 'http://172.16.180.166:8081',
  // token 在 localStorage 的 key
  TOKEN_KEY: 'eaiselp_token',
  // 登录页 / 主框架路径
  LOGIN_PAGE: 'login.html',
  INDEX_PAGE: 'index.html'
};
