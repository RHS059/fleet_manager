// Loads the logic class from four parts (split to keep each file small).
var __fmLoad = function (f) { var r = new XMLHttpRequest(); r.open('GET', f, false); r.send(); return r.responseText; };
var Component = new Function('DCLogic', 'StreamableLogic', 'React', ['app-logic-1.js', 'app-logic-2a.js', 'app-logic-2b.js', 'app-logic-2c.js'].map(__fmLoad).join('') + '\n;return Component;')(DCLogic, DCLogic, React);
