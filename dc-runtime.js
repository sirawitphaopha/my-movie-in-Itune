/* dc-runtime.js
 * ตัวแปลเทมเพลต (DC template interpreter) — แปลงเทมเพลต <x-dc> ของ Claude design
 * ให้กลายเป็น React elements โดยตรง ไม่ต้องมีขั้นตอน build
 *
 * รองรับ directive: {{ path }}, <sc-if value="{{ }}">, <sc-for list="{{ }}" as="x">,
 *                   onClick/onInput/... , style="...", style-hover="...", style-focus="..."
 */
(function (global) {
  'use strict';
  var h = React.createElement;

  /* ---- แปลงชื่อ attribute → ชื่อ prop ของ React ---- */
  var ATTR_MAP = {
    colspan: 'colSpan', rowspan: 'rowSpan', 'class': 'className', 'for': 'htmlFor',
    inputmode: 'inputMode', maxlength: 'maxLength', tabindex: 'tabIndex',
    readonly: 'readOnly', crossorigin: 'crossOrigin', autocomplete: 'autoComplete'
  };
  var VOID = { img: 1, input: 1, br: 1, hr: 1, meta: 1, col: 1, source: 1, area: 1, wbr: 1 };

  /* ---- หาค่าจาก path เช่น "m.stars" ในขอบเขต (scope) ---- */
  function resolve(path, scope) {
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (path === 'undefined') return undefined;
    if (/^-?\d+(?:\.\d+)?$/.test(path)) return Number(path);
    var cur = scope, parts = path.split('.');
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      cur = cur[parts[i]];
    }
    return cur;
  }

  /* ---- แทนค่า {{ }} ในสตริง; ถ้าทั้งสตริงเป็น {{ }} เดียว คืนค่าดิบ (อาจเป็น function/object/bool) ---- */
  function interp(str, scope) {
    if (str == null) return str;
    var whole = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/.exec(str);
    if (whole) return resolve(whole[1], scope);
    if (str.indexOf('{{') < 0) return str;
    return str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, function (_, p) {
      var v = resolve(p, scope);
      return v == null ? '' : String(v);
    });
  }

  /* ---- แปลงสตริง CSS "a:b;c:d" → object ของ React ---- */
  function styleToObj(str) {
    var o = {}, decls = str.split(';');
    for (var i = 0; i < decls.length; i++) {
      var d = decls[i], c = d.indexOf(':');
      if (c < 0) continue;
      var prop = d.slice(0, c).trim();
      if (!prop) continue;
      var val = d.slice(c + 1).trim();
      var key = prop.charCodeAt(0) === 45 /* '-' */ ? prop
        : prop.replace(/-([a-z])/g, function (_, ch) { return ch.toUpperCase(); });
      o[key] = val;
    }
    return o;
  }

  /* ---- คอมโพเนนต์เล็กๆ จัดการ hover/focus (รวม style แบบ inline เพื่อชนะ specificity) ---- */
  function Hov(props) {
    var hoverStyle = props.hoverStyle, focusStyle = props.focusStyle,
        tag = props.tag, baseStyle = props.style, children = props.children, rest = props.rest;
    var hs = React.useState(false), hovered = hs[0], setHover = hs[1];
    var fs = React.useState(false), focused = fs[0], setFocus = fs[1];
    var merged = Object.assign({}, baseStyle, hovered && hoverStyle, focused && focusStyle);
    var p = Object.assign({}, rest);
    if (hoverStyle) {
      p.onMouseEnter = function (e) { setHover(true); if (rest.onMouseEnter) rest.onMouseEnter(e); };
      p.onMouseLeave = function (e) { setHover(false); if (rest.onMouseLeave) rest.onMouseLeave(e); };
    }
    if (focusStyle) {
      p.onFocus = function (e) { setFocus(true); if (rest.onFocus) rest.onFocus(e); };
      p.onBlur = function (e) { setFocus(false); if (rest.onBlur) rest.onBlur(e); };
    }
    p.style = merged;
    return VOID[tag] ? h(tag, p) : h(tag, p, children);
  }

  function stripKeyStyle(props) {
    var o = {};
    for (var k in props) if (k !== 'key' && k !== 'style') o[k] = props[k];
    return o;
  }

  /* ---- เดินทรี: DOM node (จาก XML parse) → React element ---- */
  function renderNode(node, scope, key) {
    var nt = node.nodeType;
    if (nt === 3) { // text
      var txt = interp(node.nodeValue, scope);
      if (txt == null || txt === '') return null;
      return txt;
    }
    if (nt !== 1) return null; // ข้าม comment ฯลฯ
    var tag = node.tagName;

    if (tag === 'sc-if') {
      var cond = interp(node.getAttribute('value'), scope);
      if (!cond) return null;
      return h(React.Fragment, { key: key }, renderChildren(node, scope));
    }
    if (tag === 'sc-for') {
      var list = interp(node.getAttribute('list'), scope) || [];
      var as = node.getAttribute('as');
      var items = [];
      for (var i = 0; i < list.length; i++) {
        var cs = Object.assign({}, scope);
        cs[as] = list[i];
        items.push(h(React.Fragment, { key: i }, renderChildren(node, cs)));
      }
      return h(React.Fragment, { key: key }, items);
    }

    // element ปกติ
    var props = {}, hoverStyle = null, focusStyle = null, attrs = node.attributes;
    for (var a = 0; a < attrs.length; a++) {
      var at = attrs[a], name = at.name, raw = at.value;
      if (name === 'style-hover') { hoverStyle = styleToObj(raw); continue; }
      if (name === 'style-focus') { focusStyle = styleToObj(raw); continue; }
      if (name === 'style') {
        var sv = interp(raw, scope);
        props.style = (typeof sv === 'string') ? styleToObj(sv) : sv;
        continue;
      }
      if (name.charCodeAt(0) === 111 /* 'o' */ && name.charCodeAt(1) === 110 /* 'n' */
          && name.length > 2 && name[2] >= 'A' && name[2] <= 'Z') {
        props[name] = interp(raw, scope); // event handler
        continue;
      }
      props[ATTR_MAP[name] || name] = interp(raw, scope);
    }
    if (key != null) props.key = key;

    // input/textarea/select: onInput → onChange (controlled input ของ React)
    if ((tag === 'input' || tag === 'textarea' || tag === 'select') && props.onInput && !props.onChange) {
      props.onChange = props.onInput;
      delete props.onInput;
    }

    if (hoverStyle || focusStyle) {
      return h(Hov, {
        key: props.key, tag: tag, style: props.style,
        hoverStyle: hoverStyle, focusStyle: focusStyle,
        rest: stripKeyStyle(props), children: VOID[tag] ? null : renderChildren(node, scope)
      });
    }
    if (VOID[tag]) return h(tag, props);
    return h(tag, props, renderChildren(node, scope));
  }

  function renderChildren(node, scope) {
    var kids = node.childNodes, out = [];
    for (var i = 0; i < kids.length; i++) {
      var r = renderNode(kids[i], scope, i);
      if (r != null) out.push(r);
    }
    return out;
  }

  /* ---- เตรียม/parse เทมเพลตครั้งเดียว ---- */
  function preprocess(src) {
    var s = src.replace(/<!--[\s\S]*?-->/g, '');                 // ตัด comment
    s = s.replace(/\s+hint-placeholder-(?:val|count)="[^"]*"/g, ''); // ตัด hint ของ editor
    s = s.replace(/<(img|input|br|hr|meta|col|source|area|wbr)\b([^>]*?)\s*\/?>/g,
      function (_, t, at) { return '<' + t + at + '/>'; });       // ปิด void element
    return s.trim();
  }

  var ROOT = null;

  function init(tplString) {
    var xml = preprocess(tplString);
    var doc = new DOMParser().parseFromString(xml, 'application/xml');
    var err = doc.querySelector('parsererror');
    if (err) throw new Error('DC template parse error:\n' + err.textContent);
    ROOT = doc.documentElement;
  }

  function renderTemplate(scope) {
    if (!ROOT) throw new Error('DC.init() ยังไม่ถูกเรียก');
    return renderNode(ROOT, scope, 'root');
  }

  global.DC = { init: init, renderTemplate: renderTemplate };
})(window);
