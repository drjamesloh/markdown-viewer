#!/usr/bin/env python3
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "jinja2",
#     "markdown-it-py",
#     "mdit-py-plugins",
#     "pygments",
# ]
# ///
"""Markdown Viewer with Mermaid Diagram Support."""

import argparse
import html
import json
import mimetypes
import sys
import threading
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote

from markdown_it import MarkdownIt
from mdit_py_plugins.front_matter import front_matter_plugin
from pygments import highlight
from pygments.lexers import get_lexer_by_name, TextLexer
from pygments.formatters import HtmlFormatter
from jinja2 import Environment, FileSystemLoader

# Global variable to store the markdown file path
markdown_file: Path = None

# Setup Jinja2 environment
templates_dir = Path(__file__).parent / "templates"
jinja_env = Environment(loader=FileSystemLoader(templates_dir))

# Create a single Markdown instance to reuse across requests
_md_instance = None


def highlight_code(code: str, lang: str, attrs: str) -> str:
    """Highlight code using Pygments, with special handling for mermaid diagrams."""
    if lang == "mermaid":
        # Return mermaid code in the structure expected by viewer.js
        escaped_code = html.escape(code)
        return f'<div class="mermaid-block"><pre class="mermaid"><code>{escaped_code}</code></pre></div>'

    if lang:
        try:
            lexer = get_lexer_by_name(lang, stripall=True)
        except Exception:
            lexer = TextLexer()
    else:
        lexer = TextLexer()

    formatter = HtmlFormatter(css_class="highlight")
    return highlight(code, lexer, formatter)


def get_markdown_instance():
    """Get or create a cached Markdown instance."""
    global _md_instance
    if _md_instance is None:
        md = MarkdownIt("gfm-like", {"highlight": highlight_code, "linkify": False})
        md.use(front_matter_plugin)
        _md_instance = md
    return _md_instance


def render_markdown(content: str) -> str:
    """Render markdown content to HTML with extensions."""
    md = get_markdown_instance()
    return md.render(content)


class MarkdownViewerHandler(BaseHTTPRequestHandler):
    """HTTP request handler for markdown viewer."""

    # Class variable to track if main page was served
    main_page_served = False

    def log_message(self, format, *args):
        """Suppress default logging."""
        pass

    def send_html(self, content: str, status: int = 200):
        """Send an HTML response."""
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.end_headers()
        self.wfile.write(content.encode("utf-8"))

    def send_json(self, data: dict, status: int = 200):
        """Send a JSON response."""
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode("utf-8"))

    def send_static_file(self, filepath: Path):
        """Serve a static file."""
        try:
            content = filepath.read_bytes()
        except FileNotFoundError:
            self.send_error(404, "File not found")
            return

        content_type, _ = mimetypes.guess_type(filepath.name)
        if content_type is None:
            content_type = "application/octet-stream"

        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(content)

    def do_GET(self):
        """Handle GET requests."""
        global markdown_file

        path = unquote(self.path)

        # Route: /content - API endpoint for raw markdown content
        if path == "/content":
            if markdown_file is None:
                self.send_json({"error": "Markdown file not found"}, 404)
                return

            try:
                content = markdown_file.read_text(encoding="utf-8")
            except FileNotFoundError:
                self.send_json({"error": "Markdown file not found"}, 404)
                return

            self.send_json({
                "filename": markdown_file.name,
                "content": content,
            })
            return

        # Route: /static/* - Static files
        if path.startswith("/static/"):
            static_dir = Path(__file__).parent / "static"
            # Remove /static/ prefix and get the file path
            relative_path = path[8:]  # Remove "/static/"
            filepath = static_dir / relative_path

            # Security: prevent directory traversal
            try:
                filepath.resolve().relative_to(static_dir.resolve())
            except ValueError:
                self.send_error(403, "Forbidden")
                return

            self.send_static_file(filepath)
            return

        # Route: / - Main viewer page
        if path == "/" or path == "":
            if markdown_file is None:
                self.send_html("<h1>404 - Markdown file not found</h1>", 404)
                return

            try:
                content = markdown_file.read_text(encoding="utf-8")
            except FileNotFoundError:
                self.send_html("<h1>404 - Markdown file not found</h1>", 404)
                return

            rendered_content = render_markdown(content)

            # Render template
            template = jinja_env.get_template("viewer.html")
            html = template.render(content=rendered_content, filename=markdown_file.name)
            self.send_html(html)

            # Mark as served for one-shot mode
            MarkdownViewerHandler.main_page_served = True
            return

        # Unknown route
        self.send_error(404, "Not found")


def main():
    """Parse arguments and start the server."""
    global markdown_file

    parser = argparse.ArgumentParser(
        description="Markdown Viewer with Mermaid Diagram Support"
    )
    parser.add_argument(
        "filename",
        type=Path,
        help="Path to the markdown file to view",
    )
    parser.add_argument(
        "--host",
        type=str,
        default="127.0.0.1",
        help="Host to bind to (default: 127.0.0.1)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Port to bind to (default: 8000)",
    )

    args = parser.parse_args()

    # Validate file exists
    if not args.filename.exists():
        print(f"Error: File '{args.filename}' not found", file=sys.stderr)
        sys.exit(1)

    markdown_file = args.filename.resolve()

    server = HTTPServer((args.host, args.port), MarkdownViewerHandler)
    url = f"http://{args.host}:{args.port}"

    print(f"Opening {markdown_file.name}...")

    # Open browser after a brief delay (in background thread)
    def open_browser():
        webbrowser.open(url)

    threading.Timer(0.1, open_browser).start()

    # Set timeout so handle_request doesn't block forever
    server.timeout = 1.0

    # One-shot: serve requests until main page is delivered
    while not MarkdownViewerHandler.main_page_served:
        server.handle_request()

    # Serve a few more requests for static files (CSS/JS)
    # handle_request returns immediately if timeout expires
    for _ in range(10):
        try:
            server.handle_request()
        except Exception:
            break

    server.server_close()


if __name__ == "__main__":
    main()