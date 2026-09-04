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
    // T21（F3）：通用 40003 试用已到期处理——业务错误码随 HTTP 200 body 返回（R.fail 形态），
    // 非登录页出现时清 token/提示并跳登录（登录页由 login.html 特判渲染红色升级指引，不在此处理）
    const origSuccess = opt.success;
    opt.success = function (resp) {
      if (resp && resp.code === 40003 && location.pathname.indexOf(CFG.LOGIN_PAGE) === -1) {
        clearToken();
        try { sessionStorage.removeItem('trialTip'); } catch (e) { /* ignore */ }
        window.alert(resp.msg || '试用已到期，请联系平台管理员升级');
        location.href = CFG.LOGIN_PAGE;
        return;
      }
      if (origSuccess) origSuccess.apply(this, arguments);
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
