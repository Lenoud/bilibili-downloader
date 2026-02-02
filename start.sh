#!/bin/bash

# Bilibili 下载器 - 快速开始脚本

echo "====== Bilibili 下载器 快速开始 ======"
echo ""
echo "请选择操作："
echo "1. 使用 UI 模式下载（支持扫码登录）"
echo "2. 使用 CLI 模式批量下载（非UI方式）"
echo "3. 编辑视频 URL 列表"
echo "4. 查看下载的文件"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo "启动 UI 模式..."
        npm start
        ;;
    2)
        echo ""
        echo "CLI 模式 - 非 UI 批量下载"
        echo "请确保已编辑 video_urls.txt 文件，每行一个 B 站视频链接"
        echo ""
        read -p "确认要开始下载？(y/n): " confirm
        if [ "$confirm" = "y" ]; then
            node app/download.js
        fi
        ;;
    3)
        if command -v nano &> /dev/null; then
            nano video_urls.txt
        elif command -v vi &> /dev/null; then
            vi video_urls.txt
        else
            echo "请手动编辑 video_urls.txt 文件"
        fi
        ;;
    4)
        if [ -d "downloads" ]; then
            echo ""
            echo "已下载的文件："
            find downloads -type f | head -20
            echo ""
            du -sh downloads
        else
            echo "downloads 目录还不存在"
        fi
        ;;
    *)
        echo "无效的选项"
        ;;
esac
