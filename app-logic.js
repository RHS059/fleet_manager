// Loads the logic class from three parts (split to keep each file small).
var __fmLoad = function (f) { var r = new XMLHttpRequest(); r.open('GET', f, false); r.send(); return r.responseText; };
var Component = new Function('DCLogic', 'StreamableLogic', 'React', __fmLoad('app-logic-1.js') + __fmLoad('app-logic-2a.js') + __fmLoad('app-logic-2b.js') + '\n;return Component;')(DCLogic, DCLogic, React);
