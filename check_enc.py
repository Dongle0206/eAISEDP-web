#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""检测前端文件的字节编码，定位乱码根因。"""
import os

files = [
    'index.html', 'login.html',
    'pages/audit-log.html', 'pages/case-detail.html',
    'pages/case-list.html', 'pages/dashboard.html',
    'pages/search.html', 'pages/user-list.html',
    'assets/js/auth.js', 'assets/js/menu.js',
]
print("=" * 60)
for f in files:
    if not os.path.exists(f):
        print(f"{f:35s} [文件不存在]")
        continue
    raw = open(f, 'rb').read()
    has_bom = raw[:3] == b'\xef\xbb\xbf'
    body = raw[3:] if has_bom else raw
    try:
        body.decode('utf-8')
        status = 'UTF-8 ' + ('(BOM)' if has_bom else '(无BOM,正确)')
    except UnicodeDecodeError:
        try:
            body.decode('gbk')
            status = '*** GBK! 乱码根因 ***'
        except Exception:
            status = '*** 未知编码 ***'
    print(f"{f:35s} {len(raw):>7d}B  {status}")
print("=" * 60)
