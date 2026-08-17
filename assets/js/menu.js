/**
 * 动态菜单（按角色码映射导航项）。
 * 所有菜单项均带 page 字段（已实现的真实页面）。
 */
(function (window) {
  const COMMON_MENUS = [
    { key: 'dashboard', title: '数据看板', page: 'pages/dashboard.html' },
    { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
    { key: 'workspace', title: '工作区文件', page: 'pages/workspace.html' },
    { key: 'artifact-view', title: '产物查看', page: 'pages/artifact-view.html' },
    { key: 'checkpoint', title: '检查点审批', page: 'pages/checkpoint.html' },
    { key: 'search', title: '全局搜索', page: 'pages/search.html' },
    { key: 'capabilities', title: '能力注册表', page: 'pages/capabilities.html' },
    { key: 'mcp', title: 'MCP 工具', page: 'pages/mcp.html' }
  ];

  const ROLE_MENUS = {
    platform_admin: [
      { key: 'user', title: '用户管理', page: 'pages/user-list.html' },
      { key: 'role', title: '角色管理', page: 'pages/role-list.html' },
      { key: 'model-routing', title: '模型路由', page: 'pages/model-routing.html' },
      { key: 'quota', title: '配额管理', page: 'pages/quota.html' },
      { key: 'audit-log', title: '审计日志', page: 'pages/audit-log.html' },
      { key: 'monitor', title: '系统监控', page: 'pages/monitor.html' }
    ],
    tenant_admin: [
      { key: 'user', title: '用户管理', page: 'pages/user-list.html' },
      { key: 'llm-key', title: 'LLM Key 配置', page: 'pages/llm-key.html' },
      { key: 'report', title: '统计报表', page: 'pages/report.html' },
      { key: 'role', title: '角色管理', page: 'pages/role-list.html' },
      { key: 'model-routing', title: '模型路由', page: 'pages/model-routing.html' },
      { key: 'quota', title: '配额管理', page: 'pages/quota.html' },
      { key: 'audit-log', title: '审计日志', page: 'pages/audit-log.html' },
      { key: 'monitor', title: '系统监控', page: 'pages/monitor.html' }
    ],
    project_manager: [],
    engineer: [],
    executive: [
      { key: 'quota', title: '配额管理', page: 'pages/quota.html' }
    ]
  };

  const PLATFORM_ROLES = ['platform_admin', 'tenant_admin', 'project_manager', 'engineer', 'executive'];

  window.EAISELP_MENU = {
    build: function (roleCodes) {
      const seen = {};
      const menus = [];
      const push = function (m) { if (!seen[m.key]) { seen[m.key] = true; menus.push(m); } };
      (roleCodes || []).forEach(function (code) {
        if (PLATFORM_ROLES.indexOf(code) === -1) return;
        (ROLE_MENUS[code] || []).forEach(push);
      });
      COMMON_MENUS.forEach(push);
      return menus;
    },
    primaryRoleName: function (roleCodes) {
      for (let i = 0; i < (roleCodes || []).length; i++) {
        if (PLATFORM_ROLES.indexOf(roleCodes[i]) !== -1) return roleCodes[i];
      }
      return '用户';
    }
  };
})(window);
