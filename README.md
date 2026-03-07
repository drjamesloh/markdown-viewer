# Markdown Viewer

A Python-based markdown viewer with Mermaid diagram support, syntax highlighting, and GitHub-style rendering.

## Features

- Renders markdown files in your browser with GitHub-style formatting
- Mermaid diagram support (flowcharts, sequence diagrams, etc.)
- Syntax highlighting for code blocks
- Fullscreen mode for Mermaid diagrams with zoom/pan (double-click to open)
- Auto-opens browser and exits after rendering

## Installation

```bash
uv sync
```

## Usage

```bash
uv run markdown_viewer.py <filename.md>
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--host` | 127.0.0.1 | Host to bind to |
| `--port` | 8000 | Port to bind to |

### Examples

```bash
# View a markdown file
uv run markdown_viewer.py sample_markdown/basic.md

# Use a different port
uv run markdown_viewer.py sample_markdown/basic.md --port 3000

# Bind to all interfaces
uv run markdown_viewer.py sample_markdown/basic.md --host 0.0.0.0
```

## Supported Markdown Features

- Text formatting (bold, italic, strikethrough, inline code)
- Headers (h1-h6)
- Lists (ordered and unordered, nested)
- Links and images
- Blockquotes
- Code blocks with syntax highlighting
- Tables
- Horizontal rules
- Mermaid diagrams (flowcharts, sequence diagrams, etc.)

## Mermaid Diagrams

Double-click any Mermaid diagram to open it in fullscreen mode with zoom/pan support.

Keyboard shortcuts in fullscreen mode:
- `+` / `=` - Zoom in
- `-` - Zoom out
- `Esc` - Exit fullscreen

## Dependencies

- Python 3.10+
- markdown
- jinja2
- pygments

Client-side libraries (bundled):
- Mermaid.js
- Highlight.js
- svg-pan-zoom