/**
 * 动态菜单（M2 Phase 1）
 * 按角色码映射导航项（PRD §4.2.3）。多角色取并集。
 * ea/pgm/orchestrator 等体系 AI 角色不映射（Q-3：不在 PLATFORM_ROLES 白名单）。
 */
(function (window) {
  // 角色码 → 导航项映射
  const ROLE_MENUS = {
    platform_admin: [
      { key: 'system', title: '系统管理' },
      { key: 'tenant', title: '租户管理' },
      { key: 'model', title: '模型路由' },
      { key: 'adapter', title: '适配器配置' },
      { key: 'monitor', title: '系统监控' }
    ],
    tenant_admin: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'user', title: '用户管理' },
      { key: 'role', title: '角色管理' },
      { key: 'program', title: '项目群看板' },
      { key: 'standard', title: '工程标准' },
      { key: 'quota', title: '配额' }
    ],
    project_manager: [
      // M3 新增：Case 管理（列表 + 详情 + 发起派生）。page 字段指向 pages/ 下页面，
      // 由 index.html 的 openTab 消费（读 menu.page → iframe 加载）。
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'case-board', title: 'Case 看板' },
      { key: 'derive-progress', title: '派生进度' },
      { key: 'checkpoint', title: '检查点审批' },
      { key: 'artifact-pm', title: '产物查看' }
    ],
    engineer: [
      { key: 'case-manage', title: 'Case 管理', page: 'pages/case-list.html' },
      { key: 'review-todo', title: '待办审查' },
      { key: 'case-detail', title: 'Case 详情' },
      { key: 'artifact-eng', title: '产物查看' },
      { key: 'my-task', title: '我的任务' }
    ],
    executive: [
      { key: 'strategy', title: '战略看板' },
      { key: 'investment', title: '投资概览' },
      { key: 'risk', title: '风险矩阵' },
      { key: 'milestone', title: '里程碑' },
      { key: 'dora', title: '效能度量' }
    ]
  };
  // 平台识别的角色码白名单（ea/pgm/orchestrator 不在内 → 不映射）
  const PLATFORM_ROLES = ['platform_admin', 'tenant_admin', 'project_manager', 'engineer', 'executive'];

  window.EAISELP_MENU = {
    // 按角色码数组生成菜单项（多角色并集，去重）
    build: function (roleCodes) {
      const seen = {};
      const menus = [];
      (roleCodes || []).forEach(function (code) {
        if (PLATFORM_ROLES.indexOf(code) === -1) return;   // 非平台角色跳过（Q-3）
        (ROLE_MENUS[code] || []).forEach(function (m) {
          if (!seen[m.key]) { seen[m.key] = true; menus.push(m); }
        });
      });
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
