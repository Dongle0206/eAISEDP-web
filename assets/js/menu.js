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
    { key: 'radar', title: '技术雷达', page: 'pages/radar.html' },
    // case-20260820 T11（D-10）：L2 治理收口四域同为租户级知识资产/治理配置，不限层、全角色可见
    // （PM/engineer/executive 只读——写按钮页内按角色隐藏、后端 403 兜底）；
    // 不挂 layerHidden（AC-SWITCH.1：菜单不随层开关联动隐藏）
    { key: 'standard-list', title: '工程标准', page: 'pages/standard-list.html' },
    { key: 'template-list', title: '模板库', page: 'pages/template-list.html' },
    { key: 'asset-list', title: '数据资产', page: 'pages/asset-list.html' },
    { key: 'quality-rule-list', title: '质量规则', page: 'pages/quality-rule-list.html' },
    // case-20260821 L3收口（T9）：GRC 风险合规 + 战略投资决策三域同为租户级知识资产，不限层、
    // 全角色可见（engineer/executive/PM 只读或按矩阵受限——写/审批按钮页内按角色隐藏、后端 403 兜底）；
    // 三域前缀不注册 LayerGuard，任何层开关组合下完整可用；不挂 layerHidden（AC-SWITCH.1 菜单不隐藏）
    { key: 'risk-board', title: '风险合规', page: 'pages/risk-board.html' },
    { key: 'compliance-check-list', title: '合规检查', page: 'pages/compliance-check-list.html' },
    { key: 'business-case-list', title: '投资决策', page: 'pages/business-case-list.html' },
    // case-20260823 商用化（T17/T18）：事故台账全五角色可见（incident:view 只读——
    // engineer/executive 写按钮页内按角色隐藏，后端 403 兜底，L3 risk-board 同法）；
    // 前缀不注册 LayerGuard，任何层开关组合下恒可用（AC-G3）；不挂 layerHidden
    { key: 'incident-list', title: '事故台账', page: 'pages/incident-list.html' }
  ];

  const ROLE_MENUS = {
    platform_admin: [
      { key: 'user', title: '用户管理', page: 'pages/user-list.html' },
      { key: 'role', title: '角色管理', page: 'pages/role-list.html' },
      { key: 'model-routing', title: '模型路由', page: 'pages/model-routing.html' },
      { key: 'quota', title: '配额管理', page: 'pages/quota.html' },
      { key: 'audit-log', title: '审计日志', page: 'pages/audit-log.html' },
      { key: 'monitor', title: '系统监控', page: 'pages/monitor.html' },
      // case-20260823 商用化（T13/T15/T18）：套餐管理/平台账单/租户管理——platform_admin 专属
      // （plan:*/bill:* 权限仅此角色；租户管理行内"订阅变更"= U2 套餐应用，仅 platform_admin）
      { key: 'plan-list', title: '套餐管理', page: 'pages/plan-list.html' },
      { key: 'invoice-list', title: '平台账单', page: 'pages/invoice-list.html' },
      { key: 'tenant-list', title: '租户管理', page: 'pages/tenant-list.html' }
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
      { key: 'dependency-board', title: '依赖管理', page: 'pages/dependency-board.html' },
      // case-20260823 商用化（T16/T18）：费用中心——tenant_admin 专属（cost:view；
      // platform_admin 亦持 cost:view 但其菜单走 platform_admin 组，此处不重复挂载；
      // executive/engineer 403——裁决 Q5，不挂菜单）
      { key: 'cost-center', title: '费用中心', page: 'pages/cost-center.html' }
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
