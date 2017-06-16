function $controller($delegate) {
  return function (expression, locals, later, ident) {
    if (!locals || !locals.$scope)
      return $delegate.apply(this, arguments);

    const attrs = (locals.$attrs && locals.$attrs.$attr) ? filterAttrs(Object.keys(locals.$attrs.$attr)) : '';
    const elements = (locals.$element && locals.$element[0] && locals.$element[0].tagName) ? filterElements(locals.$element[0].tagName) : '';
    const element = `${elements}${attrs}`;
    let name = expression;
    if (name instanceof Array)
      name = name[name.length - 1];

    if (typeof name === 'function') {
      name = name.name;
    }

    if (typeof name === 'string')
      locals.$scope.$$da_context = {
        name: name || (locals.$scope.$$da_context ? (locals.$scope.$$da_context.name || '') : ''),
        element: element || (locals.$scope.$$da_context ? (locals.$scope.$$da_context.element || '') : ''),
      };

    return $delegate.apply(this, arguments);
  };
}

$controller.$inject = ['$delegate'];

export default $controller;

function filterElements(tagName) {
  const standardElements = ['a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'b', 'base', 'basefont', 'bdi', 'bdo', 'bgsound', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'command', 'content', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'embed', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'frame', 'frameset', 'h1&gt;–&lt;h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'iframe', 'image', 'img', 'input', 'ins', 'isindex', 'kbd', 'keygen', 'label', 'legend', 'li', 'link', 'listing', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meta', 'meter', 'multicol', 'nav', 'nobr', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'picture', 'plaintext', 'pre', 'progress', 'q', 'rp', 'rt', 'rtc', 'ruby', 's', 'samp', 'script', 'section', 'select', 'shadow', 'slot', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr', 'xmp', 'nextid'];
  if (!tagName || standardElements.includes(tagName.toLowerCase()))
    return '';

  return `${tagName.toLowerCase()}_`;
}

function filterAttrs(attrs) {
  const standardAttrs = ['class', 'contenteditable', 'id', 'slot', 'style', 'tabindex', 'title'];
  if (!attrs || !attrs.length)
    return '';

  const name = attrs.filter(a => {
    return !standardAttrs.includes(a) && !a.match(/^ng.+/g);
  }).join('_');

  return name || '';
}
