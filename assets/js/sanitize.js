/**
 * 公共 HTML 清洗（XSS 防护，#31 / 安全评审 H1）。
 *
 * 来源：case-detail.html:807 与 artifact-view.html:213 既有 sanitizeHtml 先例抽公共——
 * markdown 正文为用户输入，marked.parse 后必须过 DOM 级清洗再注入 innerHTML。
 * 正则删 <script> 无法防御嵌套构造（如 <scr<script>ipt>）与事件属性（<img onerror=...>），
 * 必须走 DOM 解析后逐节点清洗。
 *
 * 清洗规则（与先例逐条一致）：
 *   1. 删除 script / iframe / object / embed / link / style 节点；
 *   2. 删除全部 on* 事件属性（onerror/onload/onclick...）；
 *   3. 删除 href / src 的 javascript: 协议（含大小写与空白变体，经 DOM 规范化后判定）。
 *
 * 依赖：浏览器 DOM（document.createElement）；无 jQuery / marked 依赖，任意页面可引。
 */
(function (window, document) {
  'use strict';

  function sanitizeHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll('script,iframe,object,embed,link,style').forEach(function (n) { n.remove(); });
    div.querySelectorAll('*').forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var n = attr.name.toLowerCase(), v = String(attr.value).toLowerCase().trim();
        if (n.startsWith('on') || (n === 'href' && v.startsWith('javascript:')) || (n === 'src' && v.startsWith('javascript:'))) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return div.innerHTML;
  }

  window.sanitizeHtml = sanitizeHtml;
})(window, document);
