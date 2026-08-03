/**
 * API 封装层（M2 Phase 1）
 * - 自动带 Authorization header
 * - 401 自动清 token 跳登录
 * - 统一错误回调
 */
(function (window, $) {
  const CFG = window.EAISELP_CONFIG;

  function getToken() {
    return localStorage.getItem(CFG.TOKEN_KEY);
  }
  function setToken(t) {
    localStorage.setItem(CFG.TOKEN_KEY, t);
  }
  function clearToken() {
    localStorage.removeItem(CFG.TOKEN_KEY);
  }

  function request(options) {
    const opt = $.extend({ dataType: 'json', contentType: 'application/json' }, options);
    // 自动带 token（除非显式 noAuth）
    if (!opt.noAuth) {
      const token = getToken();
      if (token) {
        opt.headers = $.extend({ 'Authorization': 'Bearer ' + token }, opt.headers || {});
      }
    }
    // 401 统一处理
    const origError = opt.error;
    opt.error = function (xhr) {
      if (xhr.status === 401) {
        clearToken();
        if (location.pathname.indexOf(CFG.LOGIN_PAGE) === -1) {
          location.href = CFG.LOGIN_PAGE;
        }
      }
      if (origError) origError(xhr);
    };
    return $.ajax(opt);
  }

  // 便捷方法
  function authPost(path, data, noAuth) {
    return request({ url: CFG.AUTH_BASE_URL + path, method: 'POST', data: JSON.stringify(data), noAuth: noAuth === true });
  }
  function authGet(path) {
    return request({ url: CFG.AUTH_BASE_URL + path, method: 'GET' });
  }

  // 业务 API（runtime 主机）便捷方法：自动拼 API_BASE_URL + token + JSON body
  function bizRequest(method, path, data) {
    const opt = { url: CFG.API_BASE_URL + path, method: method };
    if (data !== undefined) opt.data = JSON.stringify(data);
    return request(opt);
  }

  window.EAISELP_API = {
    getToken, setToken, clearToken, request,
    login: function (u, p) { return authPost('/api/v1/auth/login', { username: u, password: p }, true); },
    current: function () { return authGet('/api/v1/auth/current'); },
    logout: function () { return authPost('/api/v1/auth/logout', {}, false); },
    // 业务 API（Phase 2 扩展）
    bizGet: function (path) { return bizRequest('GET', path); },
    bizPost: function (path, data) { return bizRequest('POST', path, data); },
    bizPut: function (path, data) { return bizRequest('PUT', path, data); },
    bizDelete: function (path) { return bizRequest('DELETE', path); }
  };
})(window, jQuery);
