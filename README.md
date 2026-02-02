# Mimi Downloader

[英文/English](README.EN.md)

基于 Node.js 和 Electron 开发的 Bilibili 视频、弹幕下载器。

## 🚀 快速开始

### 方式1：图形界面版本（推荐新手）
```bash
npm install
npm start
```

### 方式2：命令行版本（适合服务器/批量下载）
```bash
npm install
npm install qrcode-terminal  # CLI版本额外依赖
npm run cli
```

![](screenshot.png)

## 功能

目前实现的功能：
- 根据视频 URL 查询视频详细信息并获取视频下载地址
- 根据视频 `cid` 获取视频弹幕的内容并支持转换下载格式（`.xml` 或 `.ass`）
- 下载视频和音频文件（格式分别为 `.mp4` 及 `.m4a`），支持断点续传
- 下载完成后支持自动使用 `ffmpeg` 合并视频和音频文件
- **🆕 CLI版本支持终端二维码登录和批量下载**

目前的局限性：
- 由于 Bilibili 限制，在未登录情况下只能获得低清晰度视频

## 使用方法

你需要安装 [Git](https://git-scm.com) 和 [Node.js](https://nodejs.org/en/download)（以及 [npm](http://npmjs.com)）来运行本程序。  
本程序的一个重要依赖是 Electron，如果你所在的网络环境受到限制，请先设置如下环境变量，再执行后面的命令，以通过镜像安装之：
```bash
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" # 一般的 *NIX 命令行
set ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/ # 使用 Windows CMD 命令行
$env:ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" # Windows PowerShell
```

在命令行输入：
```bash
# 克隆这个仓库
git clone https://github.com/stevenjoezhang/bilibili-downloader.git
# 进入目录
cd bilibili-downloader
# 安装依赖
npm install
# 启动！
npm start
```
如果一切正常，会打开一个名为「Mimi Downloader」的新窗口。输入视频链接（例如 https://www.bilibili.com/video/BV1z4411p7Lq ），按照提示即可下载视频。

下载完成后，可以使用 ffmpeg 将视频和音频合并为一个文件：
```bash
ffmpeg -i input_video.mp4 -i input_audio.m4a -c:v copy -c:a aac output_file.mp4
```
见 https://trac.ffmpeg.org/wiki/Concatenate

## 相关项目

哔哩下载姬及其跨平台版本也是不错的选择，能够在扫码登录后下载高清视频。

- [downkyi](https://github.com/leiurayer/downkyi) by leiurayer
- [downkyicore](https://github.com/yaobiao131/downkyicore) by yaobiao131

如果你需要更为强大的命令行工具，那么以下仓库或许有帮助。如果需要下载高清视频，可能需要手动设置 Cookie。

- [you-get](https://github.com/soimort/you-get) by soimort, MIT license
- [lux](https://github.com/iawia002/lux) by iawia002
- [youtube-dl](https://github.com/ytdl-org/youtube-dl) by ytdl-org

这里还有一些其它的库和浏览器插件供参考。

- [XML 转 ASS 库](https://github.com/tiansh/us-danmaku) 以及 bilibili ASS Danmaku Downloader by tiansh, Mozilla Public License 2.0
- [bilitwin](https://github.com/Xmader/bilitwin) by Xmader
- [bili-api](https://github.com/simon300000/bili-api) by simon300000

## CLI 版本使用说明

项目现已支持完全独立的命令行版本，无需安装 Electron，适合服务器环境和批量下载。

### 安装 CLI 依赖

```bash
npm install qrcode-terminal
```

### 基本使用

```bash
# 登录（显示终端二维码）
npm run login

# 下载视频
npm run cli

# 自定义参数
node cli.js -u my_urls.txt -o ./downloads
```

### 命令行参数

- `-u, --urls <文件>`: 指定URL文件路径 (默认: video_urls.txt)
- `-o, --output <目录>`: 指定输出目录 (默认: downloads)
- `-l, --login`: 仅执行登录操作
- `-h, --help`: 显示帮助信息

### URL 文件格式

创建 `video_urls.txt` 文件，每行一个视频链接：

```
https://www.bilibili.com/video/BV1xxx
https://www.bilibili.com/video/BV2xxx
```

### 特性

- ✅ 完全独立，不依赖 Electron
- ✅ 终端二维码登录
- ✅ 批量下载支持
- ✅ 智能文件命名（避免覆盖）
- ✅ 断点续传
- ✅ 完整的错误处理

详细说明请查看 [CLI_USAGE.md](CLI_USAGE.md)

## 许可证

GNU General Public License v3  
http://www.gnu.org/licenses/gpl-3.0.html

### Legal Issues

This software is distributed under the GPL-3.0 license.

In particular, please be aware that

> THERE IS NO WARRANTY FOR THE PROGRAM, TO THE EXTENT PERMITTED BY APPLICABLE LAW.  EXCEPT WHEN OTHERWISE STATED IN WRITING THE COPYRIGHT HOLDERS AND/OR OTHER PARTIES PROVIDE THE PROGRAM "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  THE ENTIRE RISK AS TO THE QUALITY AND PERFORMANCE OF THE PROGRAM IS WITH YOU.  SHOULD THE PROGRAM PROVE DEFECTIVE, YOU ASSUME THE COST OF ALL NECESSARY SERVICING, REPAIR OR CORRECTION.

Translated to human words:

*In case your use of the software forms the basis of copyright infringement, or you use the software for any other illegal purposes, the authors cannot take any responsibility for you.*

We only ship the code here, and how you are going to use it is left to your own discretion.

## 待实现

- [x] 显示发送弹幕的用户信息
- [ ] 检查登录状态
