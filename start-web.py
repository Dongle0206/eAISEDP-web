#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
eAISEDP 前端静态服务器（开发/演示用）。
修复 Python http.server 默认不返回 charset=utf-8 导致中文乱码的问题。
生产环境请用 Nginx（deploy/nginx/nginx.conf 已配置 charset utf-8）。
"""
import http.server
import socketserver
import sys

PORT = 8080
DIRECTORY = "."


class UTF8Handler(http.server.SimpleHTTPRequestHandler):
    """按文件扩展名返回正确的 Content-Type + charset=utf-8。"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def guess_type(self, path):
        ctype = super().guess_type(path)
        lower = path.lower()
        # 强制文本类资源带 charset=utf-8（HTML/JS/CSS/JSON/纯文本）
        if lower.endswith((".html", ".htm")):
            return "text/html; charset=utf-8"
        if lower.endswith(".js"):
            return "application/javascript; charset=utf-8"
        if lower.endswith(".css"):
            return "text/css; charset=utf-8"
        if lower.endswith(".json"):
            return "application/json; charset=utf-8"
        if lower.endswith((".txt", ".md")):
            return "text/plain; charset=utf-8"
        return ctype  # 图片/字体等二进制资源保持原样


def main():
    port = PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            pass
    with socketserver.TCPServer(("", port), UTF8Handler) as httpd:
        print(f"eAISEDP 前端服务已启动: http://localhost:{port}/login.html")
        print(f"服务目录: {DIRECTORY}")
        print("按 Ctrl+C 停止")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n已停止")


if __name__ == "__main__":
    main()
