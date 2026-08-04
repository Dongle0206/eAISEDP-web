/**
 * eAISEDP 前端配置
 *
 * M4-1 高可用部署后，Nginx 80 端口统一入口：
 *   /api/v1/auth/* → auth(8085/8086) 负载均衡
 *   /api/*         → runtime(8081/8082) 负载均衡
 *   其他           → 前端静态文件
 *
 * 前端同源访问（base-url 为空），消除跨域问题。
 * 如果不用 Nginx（直连模式），改为：
 *   AUTH_BASE_URL: 'http://172.16.180.166:8085'
 *   API_BASE_URL: 'http://172.16.180.166:8081'
 */
window.EAISELP_CONFIG = {
  // Nginx 同源模式（推荐，M4-1 高可用部署用这个）
  AUTH_BASE_URL: '',
  API_BASE_URL: '',
  // 直连模式（不用 Nginx 时取消注释）
  // AUTH_BASE_URL: 'http://172.16.180.166:8085',
  // API_BASE_URL: 'http://172.16.180.166:8081',
  TOKEN_KEY: 'eaiselp_token',
  LOGIN_PAGE: 'login.html',
  INDEX_PAGE: 'index.html'
};
