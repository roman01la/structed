# Structured editing for JavaScript

## Features

* Hierarchical navigation (expand/shrink selection or cursor position)
* Manipulate nodes instead of plain text (copy/cut)

## How it works

Because JavaScript’s source code is represented as plain text we need to parse it into AST first (structured representation of the code). And then analyze AST, with respect to cursor position in the editor, and compute selection range for AST nodes that should be “in focus” by walking the structure and extracting location data.
