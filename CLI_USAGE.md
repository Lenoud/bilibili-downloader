# Bilibili 下载器 - CLI 版本使用说明

本项目现已支持两种独立版本：

## 1. UI 版本（图形界面）

```bash
npm start
```

启动图形界面进行下载。

## 2. CLI 版本（命令行）- 完全独立，无需Electron

### 安装依赖

CLI版本需要安装额外的依赖：

```bash
npm install qrcode-terminal
```

### 使用方式

#### 第一步：登录（可选但推荐）

**方式1：独立登录**
```bash
npm run login
# 或
node cli.js --login
```

程序会生成二维码并显示在终端，请使用哔哩哔哩APP扫描登录。

**方式2：下载时自动登录**
运行下载命令时如果未登录，会提示是否现在登录。

#### 第二步：准备视频URL文件

编辑项目根目录下的 `video_urls.txt` 文件，每行一个B站视频链接：

```
https://www.bilibili.com/video/BV1xxx
https://www.bilibili.com/video/BV2xxx
https://www.bilibili.com/video/BV3xxx
```

#### 第三步：运行下载

**方式1：使用npm脚本**
```bash
npm run cli
```

**方式2：直接运行**
```bash
node cli.js
```

**方式3：自定义参数**
```bash
# 指定URL文件和输出目录
node cli.js --urls my_urls.txt --output ./videos

# 简写形式
node cli.js -u my_urls.txt -o ./videos
```

### 命令行参数

```
-u, --urls <文件>     指定URL文件路径 (默认: video_urls.txt)
-o, --output <目录>   指定输出目录 (默认: downloads)
-l, --login           仅执行登录操作
-h, --help            显示帮助信息
```

### 示例

```bash
# 基本使用
npm run cli

# 指定文件和目录
node cli.js -u my_videos.txt -o /Users/username/Videos

# 仅登录
npm run login

# 显示帮助
node cli.js --help
```

### 输出结构

```
downloads/
├── [BV1xxx]视频标题1/
│   ├── video_1920x1080_avc1_1_3000k.mp4
│   ├── video_1280x720_avc1_1_1500k.mp4
│   ├── audio_mp4a_40_2_128k.mp4
│   └── audio_mp4a_40_5_64k.mp4
├── [BV2xxx]视频标题2/
│   ├── video_1920x1080_avc1_1_3000k.mp4
│   ├── audio_mp4a_40_2_128k.mp4
│   └── ...
└── ...
```

### 文件命名规则

为避免相同分辨率的文件覆盖，CLI版本使用详细的命名规则：

```
{类型}_{分辨率}_{编码}_{码率}.{扩展名}
```

例如：
- `video_1920x1080_avc1_1_3000k.mp4` - 1920x1080分辨率，AVC1编码，3000kbps码率
- `audio_mp4a_40_2_128k.mp4` - 音频，MP4A编码，128kbps码率

### 特性

- ✅ 完全独立，不依赖Electron
- ✅ 终端二维码登录
- ✅ 自动检测登录状态
- ✅ 登录时下载高清视频，未登录时下载标清
- ✅ 单个视频多P支持
- ✅ 下载失败自动重试
- ✅ 断点续传支持
- ✅ 智能文件命名，避免覆盖
- ✅ 完整的错误处理和日志输出

### 常见问题

**Q: 如何登录以获得更高清晰度？**
A: 运行 `npm run login` 或 `node cli.js --login`，然后扫描终端显示的二维码。

**Q: 未登录只能下载标清吗？**
A: 是的，由于B站限制，未登录时只能获得 540p 的视频。

**Q: 下载被中断了怎么办？**
A: 重新运行相同的命令即可继续下载，会从断点处继续。

**Q: 视频和音频分开了，如何合并？**
A: 项目包含 FFmpeg 支持，可以使用以下命令合并：
```bash
ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a aac output.mp4
```

**Q: CLI版本和UI版本的区别？**
A: CLI版本完全独立，无需安装Electron，可以在服务器环境运行。UI版本提供图形界面，更适合桌面使用。

### 环境要求

- Node.js >= 14
- 已安装 `qrcode-terminal` 包（用于显示二维码）

### 安装qrcode-terminal

```bash
npm install qrcode-terminal
```

