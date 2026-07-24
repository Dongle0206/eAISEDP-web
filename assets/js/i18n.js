/**
 * 文案 i18n（M2 Phase 1）
 * Q-2 裁决：Phase 1 只中文，代码预留 i18n 结构（key-value 映射）。
 * M3 加英文只需扩 lang 表 + getUserLang 切换。
 */
(function (window) {
  const lang = {
    'zh-CN': {
      // 通用
      'app.title': '企业级 AI 软件工程平台',
      'app.brand': 'eAISEDP',
      'common.loading': '正在加载...',
      'common.logout': '退出',
      'common.logout.confirm': '确认退出登录？',
      'common.logout.sidebar': '退出登录',
      'common.placeholder.building': '建设中',
      'common.placeholder.sub': '该功能将在后续版本提供',

      // 登录页
      'login.title': 'eAISEDP 登录',
      'login.subtitle': '企业级 AI 软件工程平台',
      'login.subtitle.en': 'AI-Powered Software Engineering Platform',
      'login.username': '用户名',
      'login.password': '密码',
      'login.submit': '登 录',
      'login.submitting': '登录中...',
      'login.error.empty': '请输入用户名和密码',
      'login.error.network': '网络异常，请检查连接',
      'login.error.default': '登录失败',
      'login.footer': '© 2026 eAISELP · v0.2.0-M2',
      'login.http.tip': '（开发期 HTTP 传输，生产请启用 HTTPS）'
    }
  };

  function getCurrentLang() {
    // M2 固定中文；M3 从 navigator.language 或用户偏好读
    return 'zh-CN';
  }

  window.EAISELP_I18N = {
    t: function (key) {
      const table = lang[getCurrentLang()] || lang['zh-CN'];
      return table[key] != null ? table[key] : key;
    },
    lang: getCurrentLang
  };
})(window);
