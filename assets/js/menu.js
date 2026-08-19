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
    { key: 'mcp', title: 'MCP 工具', page: 'pages/mcp.html' },
    // R1 评审修复：ADR 库/技术雷达是租户级知识资产，不限层、全角色（engineer/PM/executive 等）可见（只读），
    // 从 tenant_admin 专属移入公共菜单；后端不注册 LayerGuard，任何开关组合下恒可用（AC-SWITCH.2）
    { key: 'adr-list', title: 'ADR 库', page: 'pages/adr-list.html' },
    { key: 'radar', title: '技术雷达', page: 'pages/radar.html' }
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
      { key: 'monitor', title: '系统监控', page: 'pages/monitor.html' },
      // 批5 三层贯通：L2/L3 管理入口（受租户分层开关控制，关闭时页面显示 43001/43002 友好提示）
      { key: 'program-list', title: '项目群管理', page: 'pages/program-list.html' },
      { key: 'project-list', title: '项目管理', page: 'pages/project-list.html' },
      { key: 'principle-list', title: '架构原则', page: 'pages/principle-list.html' },
      { key: 'gate-rule-list', title: '门禁规则', page: 'pages/gate-rule-list.html' },
      { key: 'layer-settings', title: '分层设置', page: 'pages/layer-settings.html' },
      // 批C L2治理核心：DORA/依赖挂 L2 开关过滤（保持 tenant_admin 专属不变）；
      // ADR 库/技术雷达已移 COMMON_MENUS（R1：租户级知识资产全角色可见，不再挂 tenant_admin）
      { key: 'dora-board', title: '效能看板', page: 'pages/dora-board.html' },
      { key: 'dependency-board', title: '依赖管理', page: 'pages/dependency-board.html' }
    ],
    project_manager: [
      // 批5 三层贯通：项目经理可管理项目（L2 关闭时页面显示 43002 友好提示）
      { key: 'project-list', title: '项目管理', page: 'pages/project-list.html' }
    ],
    engineer: [],
    executive: [
      { key: 'strategy-list', title: '战略管理', page: 'pages/strategy-list.html' },
      // D7 高管一屏直达：战略看板入口（复用 strategy-* 分层过滤，L3 关闭随 strategy-list 一并隐藏）
      { key: 'strategy-board', title: '战略看板', page: 'pages/strategy-board.html' },
      { key: 'quota', title: '配额管理', page: 'pages/quota.html' },
      { key: 'layer-settings', title: '分层设置', page: 'pages/layer-settings.html' }
    ]
  };

  const PLATFORM_ROLES = ['platform_admin', 'tenant_admin', 'project_manager', 'engineer', 'executive'];

  window.EAISELP_MENU = {
    /**
     * 按角色码构建菜单（AC-F10.1：菜单仅含启用层功能）。
     *
     * @param {string[]} roleCodes 当前用户角色码
     * @param {{strategyEnabled?: boolean, programProjectEnabled?: boolean}} [layers]
     *   租户分层开关；缺省/字段缺省视为开启（调用方请求失败时的兜底语义，两层全开）
     */
    build: function (roleCodes, layers) {
      const strategyOn = layers ? layers.strategyEnabled !== false : true;
      const programProjectOn = layers ? layers.programProjectEnabled !== false : true;
      // 分层过滤：L3 关 → 隐藏战略入口（strategy- 前缀：strategy-list 与 D7 新增 strategy-board 一并隐藏）；
      // L2 关 → 隐藏项目群/项目管理入口，以及依赖 L2 数据的批C入口（dora-board/dependency-board，strategy 前缀规则之外的显式补挂）；
      // adr-list/radar 不限层（后端不注册 LayerGuard）且已入 COMMON_MENUS（R1 全角色可见），任何开关组合下不隐藏（AC-SWITCH.2）。
      // case-manage 属 COMMON（L1 恒开）不参与过滤；layer-settings 保留（管理员需进入重新开层）。
      const layerHidden = function (m) {
        if (!strategyOn && String(m.key).indexOf('strategy-') === 0) return true;
        if (!programProjectOn && (m.key.indexOf('program-') === 0 || m.key.indexOf('project-') === 0)) return true;
        if (!programProjectOn && (m.key === 'dora-board' || m.key === 'dependency-board')) return true;
        return false;
      };
      const seen = {};
      const menus = [];
      const push = function (m) {
        if (seen[m.key] || layerHidden(m)) return;
        seen[m.key] = true;
        menus.push(m);
      };
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
