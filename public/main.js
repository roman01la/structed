const cm = new CodeMirror(window.root, {
  mode: "javascript",
  lineNumbers: true,
  matchBrackets: true,
  styleActiveLine: true,
  autoCloseBrackets: true
});

const getCursor = () => {
  const { line, ch } = cm.getCursor();
  return { line, column: ch };
};

const toSelection = ({ start, end }) => {
  return [
    {
      line: start.line - 1,
      ch: start.column
    },
    {
      line: end.line - 1,
      ch: end.column
    }
  ];
};

const fromCMRange = ({ anchor, head }) => {
  return [
    {
      line: anchor.line,
      column: anchor.ch
    },
    {
      line: head.line,
      column: head.ch
    }
  ];
};

const toCursor = ({ line, column }) => {
  return {
    line: line - 1,
    ch: column
  };
};

const findNodeAtCursor = () => {
  const ast = getAST();
  const { line, column } = getCursor();
  const cursor = { line: line + 1, column };
  const path = struct.expandSelectionAt({
    start: cursor,
    end: cursor,
    ast
  });
  const loc = toSelection(path.node.loc);
  return [path, loc];
};

const isInRange = ({ start, end }, cursor) =>
  cursor.line >= start.line &&
  cursor.column >= start.column &&
  cursor.line <= end.line &&
  cursor.column <= end.column;

const keys = {
  ctrl: 17,
  alt: 18,
  s: 83,
  d: 68,
  z: 90,
  x: 88,
  a: 65,
  p: 80,
  n: 78,
  m: 77,
  k: 75
};

const kkode2key = Object.entries(keys).reduce((o, [k, v]) => {
  o[v] = k;
  return o;
}, {});

const structKeys = {
  selectNodeAt: [keys.ctrl, keys.alt, keys.a],
  expandSelectionAt: [keys.ctrl, keys.alt, keys.s],
  shrinkSelectionAt: [keys.ctrl, keys.alt, keys.d],
  nextNodeAt: [keys.ctrl, keys.alt, keys.x],
  prevNodeAt: [keys.ctrl, keys.alt, keys.z],
  toTopLevel: [keys.ctrl, keys.alt, keys.p],
  cutNodeAt: [keys.ctrl, keys.alt, keys.k]
};

const structKeysHelp = {
  selectNodeAt: "select node at cursor position",
  expandSelectionAt: "expand selection to closest outer node",
  shrinkSelectionAt: "shrink selection to closest inner node",
  nextNodeAt: "jump to the next node",
  prevNodeAt: "jump to the previous node",
  toTopLevel: "jump to the very top of the current code block",
  cutNodeAt: "cut node at cursor position"
};

Object.entries(structKeys).forEach(([name, keys]) => {
  const khint = document.createElement("tr");
  let cmd = document.createElement("td");
  let desc = document.createElement("td");
  const kkeys = document.createElement("td");

  cmd.textContent = name;
  desc.textContent = structKeysHelp[name];
  kkeys.textContent = keys.map(k => kkode2key[k]).join("-");

  khint.appendChild(cmd);
  khint.appendChild(desc);
  khint.appendChild(kkeys);

  window.hint.querySelector("tbody").appendChild(khint);
});

const onStructKey = (keys, handler) => {
  let activeKeys = [];
  document.addEventListener("keydown", ({ keyCode }) => {
    if (keys.includes(keyCode)) {
      activeKeys.push(keyCode);
    }
    if (keys.length === activeKeys.length) {
      if (activeKeys.every(key => keys.includes(key))) {
        return handler();
      }
    }
  });
  document.addEventListener("keyup", ({ keyCode }) => {
    if (activeKeys.includes(keyCode)) {
      activeKeys = activeKeys.filter(key => key !== keyCode);
    }
  });
};

let currentNode;
let currentPath;

document.addEventListener("mousedown", () => {
  currentNode = undefined;
  currentPath = undefined;
});

const getAST = (() => {
  let ast;
  let prevText;
  return () => {
    const text = cm.getValue();
    if (ast === undefined || text !== prevText) {
      ast = struct.parse({ text });
      prevText = text;
    }
    return ast;
  };
})();

fetch("/src/index.js")
  .then(res => res.text())
  .then(text => {
    cm.setValue(text);
  })
  .then(() => {
    getAST();
  });

onStructKey(structKeys.selectNodeAt, () => {
  const ast = getAST();
  const { line, column } = getCursor();
  const cursor = { line: line + 1, column };
  const path = struct.expandSelectionAt({
    start: cursor,
    end: cursor,
    ast
  });
  const loc = toSelection(path.node.loc);

  currentPath = path;
  currentNode = path.node;

  cm.setSelection(...loc);
});

onStructKey(structKeys.expandSelectionAt, () => {
  let loc;
  let path;

  if (currentPath) {
    path = struct.expandSelectionAt({
      path: currentPath
    });
  } else {
    const ast = getAST();
    const { line, column } = getCursor();
    const cursor = { line: line + 1, column };
    path = struct.expandSelectionAt({
      start: cursor,
      end: cursor,
      ast
    });
  }

  currentPath = path;
  currentNode = path.node;
  loc = cm.somethingSelected()
    ? toSelection(path.node.loc)
    : toCursor(path.node.loc.start);

  if (cm.somethingSelected()) {
    cm.setSelection(...loc);
  } else {
    cm.setCursor(loc);
  }
});

onStructKey(structKeys.shrinkSelectionAt, () => {
  const path = struct.shrinkSelectionAt(currentPath);

  if (path && path.node) {
    const loc = cm.somethingSelected()
      ? toSelection(path.node.loc)
      : toCursor(path.node.loc.start);

    currentPath = path;
    currentNode = path.node;

    if (cm.somethingSelected()) {
      cm.setSelection(...loc);
    } else {
      cm.setCursor(loc);
    }
  }
});

onStructKey(structKeys.nextNodeAt, () => {
  let path;

  if (currentPath) {
    path = struct.nextNodeAt(currentPath);
  } else {
    const [ppath] = findNodeAtCursor();
    path = struct.nextNodeAt(ppath);
  }

  if (path && path.node) {
    const loc = cm.somethingSelected()
      ? toSelection(path.node.loc)
      : toCursor(path.node.loc.start);

    currentPath = path;
    currentNode = path.node;

    if (cm.somethingSelected()) {
      cm.setSelection(...loc);
    } else {
      cm.setCursor(loc);
    }
  }
});

onStructKey(structKeys.prevNodeAt, () => {
  let path;

  if (currentPath) {
    path = struct.prevNodeAt(currentPath);
  } else {
    const [ppath] = findNodeAtCursor();
    path = struct.prevNodeAt(ppath);
  }

  if (path && path.node) {
    const loc = cm.somethingSelected()
      ? toSelection(path.node.loc)
      : toCursor(path.node.loc.start);

    currentPath = path;
    currentNode = path.node;

    if (cm.somethingSelected()) {
      cm.setSelection(...loc);
    } else {
      cm.setCursor(loc);
    }
  }
});

onStructKey(structKeys.toTopLevel, () => {
  if (currentPath) {
    const path = struct.toTopLevel(currentPath);
    const loc = toCursor(path.node.loc.start);

    currentPath = path;
    currentNode = path.node;

    cm.setCursor(loc);
  } else {
    const [path] = findNodeAtCursor();
    const ppath = struct.toTopLevel(path);
    const loc = toCursor(ppath.node.loc.start);

    currentPath = ppath;
    currentNode = ppath.node;

    cm.setCursor(loc);
  }
});

onStructKey(structKeys.cutNodeAt, () => {
  if (currentNode) {
    const loc = toSelection(currentNode.loc);
    cm.replaceRange("", ...loc);
  } else {
    const [path, loc] = findNodeAtCursor();

    currentPath = path.parentPath;
    currentNode = path.parent;

    cm.replaceRange("", ...loc);
    cm.setCursor(toCursor(path.parent.loc.start));
  }
});
