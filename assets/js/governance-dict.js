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
    '.gov-tip-critical{background:#fff1f0;color:#f5222d;border:1px solid #ffa39e;font-weight:700;}'
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
