/**
 * 登录态管理（M2 Phase 1）
 */
(function (window) {
  const API = window.EAISELP_API;
  const CFG = window.EAISELP_CONFIG;

  window.EAISELP_AUTH = {
    isLoggedIn: function () { return !!API.getToken(); },
    requireLogin: function () {
      if (!this.isLoggedIn()) {
        location.href = CFG.LOGIN_PAGE;
        return false;
      }
      return true;
    },
    // 进入 index.html 时调用，恢复登录态
    restore: function (onSuccess, onFail) {
      if (!this.isLoggedIn()) { location.href = CFG.LOGIN_PAGE; return; }
      API.current().done(function (resp) {
        if (resp.code === 0) {
          if (onSuccess) onSuccess(resp.data);
        } else {
          API.clearToken();
          location.href = CFG.LOGIN_PAGE;
        }
      }).fail(function () {
        API.clearToken();
        location.href = CFG.LOGIN_PAGE;
      });
    },
    logout: function () {
      API.logout().always(function () {
        API.clearToken();
        location.href = CFG.LOGIN_PAGE;
      });
    }
  };
})(window);
