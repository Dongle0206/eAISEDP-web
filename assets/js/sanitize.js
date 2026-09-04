/**
 * 公共 HTML 清洗（XSS 防护，#31 / 安全评审 H1 + R2~R4 加固）。
 *
 * 来源：case-detail.html 与 artifact-view.html 既有 sanitizeHtml 先例抽公共——
 * markdown 正文为用户输入，marked.parse 后必须过 DOM 级清洗再注入 innerHTML。
 * 正则删 <script> 无法防御嵌套构造（如 <scr<script>ipt>）与事件属性（<img onerror=...>），
 * 必须走 DOM 解析后逐节点清洗。
 *
 * 清洗规则（R2~R4 加固后全量）：
 *   1. 删除危险标签节点：script / iframe / object / embed / link / style /
 *      base / svg / math / frame / frameset / applet
 *      （R3：base 劫持相对 URL；svg/math 是向量解析面——xlink:href、
 *       <svg><script>、MathML 事件属性，markdown 渲染不需要，整体删除）
 *   2. 删除全部 on* 事件属性（onerror/onload/onclick...）
 *   3. 删除危险属性：style（R4：CSS 钓鱼面/老浏览器 url(javascript:)）、
 *      formaction（覆盖表单提交目标）、srcdoc（iframe 内联文档）、xlink:href（R3）
 *   4. URL 属性（href/src/action/lowsrc）协议白名单（R2 关键修复）：
 *      先归一——剥除全部控制字符与空白（\x00-\x20\x7f），再判定。
 *      归一是必须的：浏览器 URL 解析会忽略协议中缀的 TAB/CR/LF，
 *      "java\tscript:" 在浏览器侧等价于 "javascript:"，但字符串 startsWith
 *      判不出来（Security 复审 R2 真实绕过）。
 *      白名单：http: / https: / mailto: / ftp: / 相对路径（/ ./ ../ # ?）
 *              / data:image/(png|jpeg|jpg|gif|webp|bmp)（明确排除 svg+xml——可带脚本）
 *      其余一律删除属性（javascript:/vbscript:/file:/data:text/...）。
 *
 * 依赖：浏览器 DOM（document.createElement）；无 jQuery / marked 依赖，任意页面可引。
 * 兜底：页面未引入本文件时，消费方应退化为 escHtml 纯文本渲染（先例写法）。
 */
(function (window, document) {
  'use strict';

  var KILL_TAGS = 'script,iframe,object,embed,link,style,base,svg,math,frame,frameset,applet';
  var KILL_ATTRS = { style: 1, formaction: 1, srcdoc: 1, 'xlink:href': 1, srcset: 1 };
  var URL_ATTRS = { href: 1, src: 1, action: 1, lowsrc: 1 };
  var URL_OK = /^(https?:|mailto:|ftp:|\/|\.{1,2}\/|#|\?)/i;
  var DATA_IMG_OK = /^data:image\/(png|jpe?g|gif|webp|bmp)/i;
  /* R2：控制字符+空白全剥（浏览器 URL 解析忽略协议中缀 TAB/CR/LF，归一后再判白名单） */
  var CTRL = /[\x00-\x20\x7f]/g;

  function safeUrl(raw) {
    var v = String(raw).replace(CTRL, '');
    return URL_OK.test(v) || DATA_IMG_OK.test(v);
  }

  function sanitizeHtml(html) {
    var div = document.createElement('div');
    div.innerHTML = html;
    div.querySelectorAll(KILL_TAGS).forEach(function (n) { n.remove(); });
    div.querySelectorAll('*').forEach(function (el) {
      Array.prototype.slice.call(el.attributes).forEach(function (attr) {
        var n = attr.name.toLowerCase();
        if (n.indexOf('on') === 0 || KILL_ATTRS[n] || (URL_ATTRS[n] && !safeUrl(attr.value))) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return div.innerHTML;
  }

  window.sanitizeHtml = sanitizeHtml;
})(window, document);
