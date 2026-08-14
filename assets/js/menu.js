/**
 * 动态菜单（M2 Phase 1）
 * 按角色码映射导航项（PRD §4.2.3）。多角色取并集。
 * ea/pgm/orchestrator 等体系 AI 角色不映射（Q-3：不在 PLATFORM_ROLES 白名单）。
 */
(function (window) {
  // 全角色共享导航项（数据看板 / 全局搜索 —— 所有平台角色可见）
  const COMMON_MENUS = [
    { key: 'dashboard', title: '数据看板', page: 'pages/dashboard.html' },
    { key: 'search', title: '全局搜索', page: 'pages/search.html' }
  ];

  // 角色码 → 角色专属导航项映射
  // 注意：只有带 page 字段的菜单项才会显示实际页面；
  // 没有 page 的菜单项在 index.html openTab 中会显示"建设中"占位。
  // 下面的菜单已经过滤掉未实现的项，只保留有实际页面的功能。
  const ROLE_MENUS = {
    platform_admin: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'user', title: '用户管理', page: 'pages/user-list.html' },
      { key: 'audit-log', title: '审计日志', page: 'pages/audit-log.html' }
    ],
    tenant_admin: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'artifact-view', title: '产物查看', page: 'pages/artifact-view.html' },
      { key: 'user', title: '用户管理', page: 'pages/user-list.html' },
      { key: 'audit-log', title: '审计日志', page: 'pages/audit-log.html' }
    ],
    project_manager: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'artifact-view', title: '产物查看', page: 'pages/artifact-view.html' }
    ],
    engineer: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'artifact-view', title: '产物查看', page: 'pages/artifact-view.html' }
    ],
    executive: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'artifact-view', title: '产物查看', page: 'pages/artifact-view.html' }
    ]
  };
  // 平台识别的角色码白名单（ea/pgm/orchestrator 不在内 → 不映射）
  const PLATFORM_ROLES = ['platform_admin', 'tenant_admin', 'project_manager', 'engineer', 'executive'];

  window.EAISELP_MENU = {
    // 按角色码数组生成菜单项（多角色并集，去重；末尾追加全角色共享项）
    build: function (roleCodes) {
      const seen = {};
      const menus = [];
      const push = function (m) { if (!seen[m.key]) { seen[m.key] = true; menus.push(m); } };
      (roleCodes || []).forEach(function (code) {
        if (PLATFORM_ROLES.indexOf(code) === -1) return;   // 非平台角色跳过（Q-3）
        (ROLE_MENUS[code] || []).forEach(push);
      });
      // 全角色共享项（数据看板 / 全局搜索）—— 追加在角色专属项之后
      COMMON_MENUS.forEach(push);
      return menus;
    },
    // 主角色徽章（第一个平台角色；无则"用户"）
    primaryRoleName: function (roleCodes) {
      for (let i = 0; i < (roleCodes || []).length; i++) {
        if (PLATFORM_ROLES.indexOf(roleCodes[i]) !== -1) return roleCodes[i];
      }
      return '用户';
    }
  };
})(window);
