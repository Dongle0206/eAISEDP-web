/**
 * 治理域枚举文案与样式集中定义（case-20260820 T6，P6/G11 前端侧——PRD §0 前置约束）。
 *
 * 覆盖字典（唯一权威，四新页 standard/template/asset/quality-rule 与 case-detail/
 * gate-rule-list/login 改造页统一引用，禁止散落各页面重复定义）：
 *   - standardStatus  工程标准状态（draft/published/deprecated）
 *   - assetType       资产类型（database/table/api/report/file，领域数据字典）
 *   - sensitivity     敏感等级四档（public/internal/sensitive/confidential，含四档色阶 class，
 *                     机密红色警示——AC-F2.3"四档可视觉区分"）
 *   - checkType       质量检查类型（completeness/accuracy/consistency/timeliness）
 *   - checkResult     检查结果（pass/fail）
 *   - trialTip        试用临期提示三档（normal 蓝 / warning 黄 / critical 红，PRD §4.3.1）
 *
 * case-20260821 L3收口追加（T5，三新页 risk-board / compliance-check-list / business-case-list
 * 统一引用，禁止散落各页面重复定义）：
 *   - riskCategory        风险类别（strategy/compliance/operations/technical/security）
 *   - riskStatus          风险状态（open/mitigating/closed）
 *   - riskLevel           风险等级四档色阶（low/medium/high/critical，cls=徽章 + heat=热力图格子底色）
 *   - complianceFramework 合规框架（djba2.0=等保 2.0/iso27001/gdpr/custom）
 *   - complianceResult    检查结果四色（pass/fail/partial/na）
 *   - bizcaseStatus       案例状态（draft/approved/rejected/executing/done）
 *
 * case-20260823 商用化追加（T12，五新页 plan-list / tenant-list / invoice-list /
 * cost-center / incident-list 统一引用，禁止散落各页面重复定义）：
 *   - planCode            套餐编码（starter/pro/enterprise/custom）
 *   - planEnabled         套餐上下架（'true'=在架/'false'=下架——V8 差异定稿 D-1：字段名 enabled 非 status）
 *   - slaLevel            SLA 三档（bronze/silver/gold 徽章 + 响应/可用性承诺文案——
 *                         D-17 全站唯一承诺文案集中处，后端零文案常量）
 *   - invoiceStatus       账单状态（draft/issued/paid）
 *   - incidentRecovered   事故恢复状态（'true'=已恢复/'false'=未恢复）
 *
 * 模板类型为开放字典（P6 裁决），不在此穷举——由 template-list 页"预置 5 值 + 列表数据聚合
 * 自定义值"生成候选（AC-F1.10）。
 *
 * 样式同样集中一处：本文件自注入 <style>（各页面不重复定义色阶/徽标样式）。
 */
(function (window, document) {
  // ---------- 样式（集中注入；配色对齐 adr-list 既有徽标体系） ----------
  var css = [
    // 标准状态徽标（draft 蓝 / published 绿 / deprecated 灰，对齐 adr-list 先例色系）
    '.gov-std-draft{background:#e6f4ff;color:#1677ff;}',
    '.gov-std-published{background:#f6ffed;color:#52c41a;}',
    '.gov-std-deprecated{background:#f5f5f5;color:#999;}',

    // 敏感等级四档色阶（公开→机密递进，机密红色警示，AC-F2.3）
    '.gov-sens-public{background:#f6ffed;color:#52c41a;}',
    '.gov-sens-internal{background:#e6f4ff;color:#1677ff;}',
    '.gov-sens-sensitive{background:#fff7e6;color:#fa8c16;}',
    '.gov-sens-confidential{background:#fff1f0;color:#f5222d;font-weight:700;}',

    // 检查结果徽标（pass 绿 / fail 红）
    '.gov-res-pass{background:#f6ffed;color:#52c41a;}',
    '.gov-res-fail{background:#fff1f0;color:#f5222d;}',

    // 通用徽标形态
    '.gov-badge{display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;line-height:18px;}',

    // 试用临期提示条三档（normal 蓝 / warning 黄 / critical 红，PRD §4.3.1）
    '.gov-tip-normal{background:#e6f4ff;color:#1677ff;border:1px solid #91caff;}',
    '.gov-tip-warning{background:#fffbe6;color:#d48806;border:1px solid #ffe58f;}',
    '.gov-tip-critical{background:#fff1f0;color:#f5222d;border:1px solid #ffa39e;font-weight:700;}',

    // ---- case-20260821 L3收口追加 ----
    // 风险等级四档徽章（低→极高递进，PRD §4.1.2 等级映射 [1,6]/[7,12]/[13,19]/[20,25]）
    '.gov-risk-low{background:#f6ffed;color:#52c41a;}',
    '.gov-risk-medium{background:#e6f4ff;color:#1677ff;}',
    '.gov-risk-high{background:#fff7e6;color:#fa8c16;}',
    '.gov-risk-critical{background:#fff1f0;color:#f5222d;font-weight:700;}',

    // 5×5 热力图格子底色四档（低→极高递进，纯 CSS Grid 用——AC-F1.12，Q4 裁决不引图表库）
    '.gov-heat-low{background:#dcf5c8;}',
    '.gov-heat-medium{background:#b3d9ff;}',
    '.gov-heat-high{background:#ffd591;}',
    '.gov-heat-critical{background:#ff9c94;}',

    // 风险状态徽章（open 开放中 / mitigating 缓解中 / closed 已关闭）
    '.gov-rs-open{background:#e6f4ff;color:#1677ff;}',
    '.gov-rs-mitigating{background:#fff7e6;color:#fa8c16;}',
    '.gov-rs-closed{background:#f5f5f5;color:#999;}',

    // 合规检查结果四色徽章（pass/fail/partial/na——AC-F1.8 结果徽章四色区分）
    '.gov-ccr-pass{background:#f6ffed;color:#52c41a;}',
    '.gov-ccr-fail{background:#fff1f0;color:#f5222d;}',
    '.gov-ccr-partial{background:#fff7e6;color:#fa8c16;}',
    '.gov-ccr-na{background:#f5f5f5;color:#999;}',

    // 案例状态徽章（draft/approved/rejected/executing/done——PRD §4.4.2 状态机）
    '.gov-bc-draft{background:#e6f4ff;color:#1677ff;}',
    '.gov-bc-approved{background:#f6ffed;color:#52c41a;}',
    '.gov-bc-rejected{background:#fff1f0;color:#f5222d;}',
    '.gov-bc-executing{background:#e6fffb;color:#13c2c2;}',
    '.gov-bc-done{background:#f9f0ff;color:#722ed1;}',

    // ---- case-20260823 商用化追加（T12）----
    // 套餐上下架徽章（enabled 1=在架 / 0=下架——V8 差异定稿 D-1，字段名 enabled 非 status）
    '.gov-plan-on{background:#f6ffed;color:#52c41a;}',
    '.gov-plan-off{background:#f5f5f5;color:#999;}',

    // SLA 三档徽章（青铜=铜灰 / 白银=蓝灰 / 黄金=金橙——三档可视觉区分，AC-F3.1）
    '.gov-sla-bronze{background:#f5f0ef;color:#8c5a3b;}',
    '.gov-sla-silver{background:#e8f0f7;color:#4a6d8c;}',
    '.gov-sla-gold{background:#fff7e6;color:#d48806;font-weight:700;}',

    // 账单状态徽章（draft/issued/paid 单向顺次状态机——AC-F2.8）
    '.gov-inv-draft{background:#e6f4ff;color:#1677ff;}',
    '.gov-inv-issued{background:#fff7e6;color:#fa8c16;}',
    '.gov-inv-paid{background:#f6ffed;color:#52c41a;}',

    // 事故恢复状态徽章（recovery_time 非空=已恢复——AC-F3.2 展示口径）
    '.gov-inc-recovered{background:#f6ffed;color:#52c41a;}',
    '.gov-inc-unrecovered{background:#fff1f0;color:#f5222d;}'
  ].join('\n');
  var style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(css));
  document.head.appendChild(style);

  // ---------- 字典数据（文案 + 样式 class 映射） ----------
  var DICT = {
    standardStatus: {
      draft: { text: '草稿', cls: 'gov-std-draft' },
      published: { text: '已发布', cls: 'gov-std-published' },
      deprecated: { text: '已废弃', cls: 'gov-std-deprecated' }
    },
    assetType: {
      database: { text: '数据库' },
      table: { text: '表' },
      api: { text: '接口' },
      report: { text: '报表' },
      file: { text: '文件' }
    },
    sensitivity: {
      public: { text: '公开', cls: 'gov-sens-public' },
      internal: { text: '内部', cls: 'gov-sens-internal' },
      sensitive: { text: '敏感', cls: 'gov-sens-sensitive' },
      confidential: { text: '机密', cls: 'gov-sens-confidential' }
    },
    checkType: {
      completeness: { text: '完整性' },
      accuracy: { text: '准确性' },
      consistency: { text: '一致性' },
      timeliness: { text: '及时性' }
    },
    checkResult: {
      pass: { text: '通过', cls: 'gov-res-pass' },
      fail: { text: '未通过', cls: 'gov-res-fail' }
    },
    trialTip: {
      normal: { text: '试用提示', cls: 'gov-tip-normal' },
      warning: { text: '试用临期', cls: 'gov-tip-warning' },
      critical: { text: '试用即将到期', cls: 'gov-tip-critical' }
    },

    // ---- case-20260821 L3收口追加（T5）：risk-board / compliance-check-list / business-case-list 三新页统一引用 ----
    /** 风险类别（领域数据字典，P6 裁决——PRD §4.1.1） */
    riskCategory: {
      strategy: { text: '战略' },
      compliance: { text: '合规' },
      operations: { text: '运营' },
      technical: { text: '技术' },
      security: { text: '安全' }
    },
    /** 风险状态（open→mitigating→closed 状态机，mitigating→open 回退合法） */
    riskStatus: {
      open: { text: '开放中', cls: 'gov-rs-open' },
      mitigating: { text: '缓解中', cls: 'gov-rs-mitigating' },
      closed: { text: '已关闭', cls: 'gov-rs-closed' }
    },
    /** 风险等级四档（cls=徽章色阶；heat=5×5 热力图格子底色档——T14 纯 CSS Grid 用） */
    riskLevel: {
      low: { text: '低', cls: 'gov-risk-low', heat: 'gov-heat-low' },
      medium: { text: '中', cls: 'gov-risk-medium', heat: 'gov-heat-medium' },
      high: { text: '高', cls: 'gov-risk-high', heat: 'gov-heat-high' },
      critical: { text: '极高', cls: 'gov-risk-critical', heat: 'gov-heat-critical' }
    },
    /** 合规框架（djba2.0 展示名=等保 2.0；custom 联动 frameworkName——AC-F1.9） */
    complianceFramework: {
      'djba2.0': { text: '等保 2.0' },
      iso27001: { text: 'ISO27001' },
      gdpr: { text: 'GDPR' },
      custom: { text: '自定义' }
    },
    /** 合规检查结果四色（pass/fail/partial/na） */
    complianceResult: {
      pass: { text: '通过', cls: 'gov-ccr-pass' },
      fail: { text: '未通过', cls: 'gov-ccr-fail' },
      partial: { text: '部分通过', cls: 'gov-ccr-partial' },
      na: { text: '不适用', cls: 'gov-ccr-na' }
    },
    /** 商业案例状态（draft→approved→executing→done；draft→rejected；终态无出边——PRD §4.4.2） */
    bizcaseStatus: {
      draft: { text: '草稿', cls: 'gov-bc-draft' },
      approved: { text: '已批准', cls: 'gov-bc-approved' },
      rejected: { text: '已拒绝', cls: 'gov-bc-rejected' },
      executing: { text: '执行中', cls: 'gov-bc-executing' },
      done: { text: '已完成', cls: 'gov-bc-done' }
    },

    // ---- case-20260823 商用化追加（T12）：plan-list / tenant-list / invoice-list / cost-center / incident-list 五新页统一引用 ----
    /** 套餐编码（starter/pro/enterprise/custom 领域字典；custom 可多份以名称区分——AC-F1.2） */
    planCode: {
      starter: { text: '入门版' },
      pro: { text: '专业版' },
      enterprise: { text: '企业版' },
      custom: { text: '定制版' }
    },
    /**
     * 套餐上下架（V8 差异定稿 D-1：字段名 enabled（Boolean，1=在架/0=下架），非 SE §7.2 的 planStatus）。
     * 键为 'true'/'false'（JS 对象键自然字符串化，DICT.badge('planEnabled', true) 直接可用）。
     */
    planEnabled: {
      'true': { text: '在架', cls: 'gov-plan-on' },
      'false': { text: '下架', cls: 'gov-plan-off' }
    },
    /**
     * SLA 服务等级三档（bronze/silver/gold）——含响应时限 + 可用性承诺文案。
     * D-17/P6：**全站唯一承诺文案集中处**（后端零文案常量），费用中心套餐卡两行渲染；
     * 纯展示不参与任何计算/赔付（§7-4/7-5 范围外）。
     */
    slaLevel: {
      bronze: { text: '青铜 Bronze', cls: 'gov-sla-bronze', promise: '响应承诺：工作日 ≤ 8 小时' , availability: '可用性承诺：99.0%' },
      silver: { text: '白银 Silver', cls: 'gov-sla-silver', promise: '响应承诺：工作日 ≤ 4 小时', availability: '可用性承诺：99.5%' },
      gold: { text: '黄金 Gold', cls: 'gov-sla-gold', promise: '响应承诺：7×24 ≤ 2 小时', availability: '可用性承诺：99.9%' }
    },
    /** 账单状态（draft→issued→paid 单向顺次，人工标记；跳变/回退后端 400——AC-F2.8） */
    invoiceStatus: {
      draft: { text: '草稿', cls: 'gov-inv-draft' },
      issued: { text: '已出账', cls: 'gov-inv-issued' },
      paid: { text: '已收款', cls: 'gov-inv-paid' }
    },
    /** 事故恢复状态（recovered 布尔由服务端按 recoveryTime 判定；键 'true'/'false'） */
    incidentRecovered: {
      'true': { text: '已恢复', cls: 'gov-inc-recovered' },
      'false': { text: '未恢复', cls: 'gov-inc-unrecovered' }
    }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  window.GOV_DICT = {
    /** 字典数据（text/cls 按键取；未知键回退原值文本、无样式） */
    data: DICT,

    /** 取文案；未知键回退原值（脏数据不显示 undefined） */
    text: function (dictName, key) {
      var d = DICT[dictName];
      var e = d && d[key];
      return e ? e.text : (key == null ? '' : String(key));
    },

    /** 取样式 class；未知键空串 */
    cls: function (dictName, key) {
      var d = DICT[dictName];
      var e = d && d[key];
      return e && e.cls ? e.cls : '';
    },

    /** 渲染徽标 HTML（unknownCls 可选，未知键的兜底样式） */
    badge: function (dictName, key, unknownCls) {
      var d = DICT[dictName];
      var e = d && d[key];
      var text = e ? e.text : (key == null ? '-' : String(key));
      var cls = e && e.cls ? e.cls : (unknownCls || 'gov-std-deprecated');
      return '<span class="gov-badge ' + cls + '">' + esc(text) + '</span>';
    },

    /** 生成下拉选项 HTML（valueEscaped；selectedKey 高亮；首项 placeholder 可选） */
    options: function (dictName, selectedKey, placeholder) {
      var d = DICT[dictName] || {};
      var html = placeholder != null ? '<option value="">' + esc(placeholder) + '</option>' : '';
      Object.keys(d).forEach(function (k) {
        var sel = String(selectedKey) === String(k) ? ' selected' : '';
        html += '<option value="' + esc(k) + '"' + sel + '>' + esc(d[k].text) + '</option>';
      });
      return html;
    }
  };
})(window, document);
