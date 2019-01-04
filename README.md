# Structured editing for JavaScript

- Core library `src/index.js`
- Example `index.html`

## Features

- Hierarchical navigation (expand/shrink selection or cursor position)
- Manipulate nodes instead of plain text (copy/cut)

## Editor plugins

- [VS Code](https://github.com/roman01la/vscode-structed)

## Editor integration guide

Structed's core library is a set of functions that walk AST and return location data for selection or cursor position to be set. It can work with any JS-based editor. See how it is used in [VS Code](https://github.com/roman01la/vscode-structed/blob/master/src/index.js) extension.

## How it works

Because JavaScript’s source code is represented as plain text we need to parse it into AST first (structured representation of the code). And then analyze AST, with respect to cursor position in the editor, and compute selection range for AST nodes that should be “in focus” by walking the structure and extracting location data.

## TODO

See [Paredit guide](http://danmidwood.com/content/2014/11/21/animated-paredit.html)

- [x] `forward`
- [x] `backward`
- [ ] `forward-up`
- [ ] `forward-down`
- [ ] `backward-up`
- [ ] `backward-down`
- [ ] `wrap-[round|square|curly|angle]`
- [ ] `forward-delete`
- [ ] `forward-kill-node`
- [ ] `backward-delete`
- [ ] `backward-kill-node`
- [ ] `kill`
- [ ] `forward-slurp`
- [ ] `backward-slurp`
- [ ] `forward-barf`
- [ ] `backward-barf`
