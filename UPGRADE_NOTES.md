# Bilibili 下载器 - 升级说明

## 变更概述

项目已成功升级为支持两种模式：

### 🎨 UI 模式（原有功能）
图形界面模式，保持原有所有功能

### ⚙️ CLI 模式（新增功能）
非 UI 命令行模式，支持批量下载和自动化

---

## 使用指南

### 方式一：UI 模式 - 图形界面

```bash
npm start
```

启动后与原有功能完全相同，支持：
- 扫码登录
- 单视频下载  
- 获取弹幕
- 自动合并视频和音频

### 方式二：CLI 模式 - 批量自动下载

**Step 1: 准备登录状态（推荐）**

为了下载高清视频，建议先登录：

```bash
npm start
```

在 UI 中扫码登录，然后关闭应用。登录状态会被保存到本地。

**Step 2: 编辑 `video_urls.txt`**

在项目根目录创建或编辑 `video_urls.txt`，每行一个 B 站视频链接：

```
https://www.bilibili.com/video/BV1xxx
https://www.bilibili.com/video/BV2xxx
https://www.bilibili.com/video/BV3xxx
```

**Step 3: 运行下载**

```bash
node app/download.js [URL文件] [输出目录]
```

#### 参数说明

- `URL文件`（可选）：包含视频 URL 的文件，默认为 `video_urls.txt`
- `输出目录`（可选）：下载文件保存的目录，默认为 `downloads/`

#### 常用命令

```bash
# 使用默认参数（从 video_urls.txt 下载到 downloads/）
node app/download.js

# 指定 URL 文件
node app/download.js my_videos.txt

# 指定输出目录
node app/download.js video_urls.txt /Users/username/Videos

# 完整指定
node app/download.js urls.txt ./videos
```

---

## 输出目录结构

```
downloads/
├── [BV1xxx]视频标题1/
│   ├── video_1920x1080.mp4    # 最高清晰度视频
│   ├── video_1280x720.mp4
│   ├── video_852x480.mp4
│   ├── video_640x360.mp4
│   ├── audio_mp4a.40.2.mp4    # 音频文件
│   └── audio_mp4a.40.2.mp4
├── [BV2xxx]视频标题2/
│   ├── video_1920x1080.mp4
│   ├── audio_mp4a.40.2.mp4
│   └── ...
└── ...
```

每个视频会被保存在以 `[BVID]视频标题` 命名的文件夹中，包含多个清晰度的视频文件和音频文件。

---

## 功能对比

| 功能 | UI 模式 | CLI 模式 |
|------|--------|--------|
| 视频下载 | ✅ | ✅ |
| 登录（扫码） | ✅ | ✅ (通过 UI 登录) |
| 高清下载 | ✅ | ✅ |
| 弹幕下载 | ✅ | ⚠️ (未包含) |
| 视音频合并 | ✅ | ⚠️ (需手动或其他工具) |
| 批量下载 | ❌ | ✅ |
| 自动化处理 | ❌ | ✅ |
| 进度显示 | ✅ | ✅ |
| 断点续传 | ✅ | ✅ |

---

## 常见问题

### Q: CLI 模式下如何登录获得高清视频？
**A:** 先运行 `npm start` 启动 UI，使用二维码扫码登录，然后关闭应用。登录状态会被自动保存，CLI 模式会使用已保存的登录信息。

### Q: 不登录只能下载什么清晰度？
**A:** 未登录时只能下载 540p 的视频，这是 B 站的限制。

### Q: 下载中断了怎么办？
**A:** 重新运行相同的命令即可从断点处继续下载。

### Q: 如何合并视频和音频？
**A:** 可以使用 FFmpeg：

```bash
# 安装 FFmpeg（如果尚未安装）
brew install ffmpeg

# 合并视频和音频
ffmpeg -i downloads/[BVXXX]标题/video_1920x1080.mp4 -i downloads/[BVXXX]标题/audio_mp4a.40.2.mp4 -c:v copy -c:a aac output.mp4
```

或在项目中使用已内置的 FFmpeg（通过 UI 模式的自动合并功能）。

### Q: 能否自动合并视频和音频？
**A:** CLI 模式目前只下载文件。未来可以添加自动合并功能，或者可以使用单独的脚本进行合并。

### Q: 支持多P视频吗？
**A:** 支持。CLI 模式会下载视频的所有可用清晰度。

### Q: 一次下载有数量限制吗？
**A:** 没有硬性限制，但建议合理安排下载任务以避免对网络和 B 站服务器造成过大压力。

---

## 注意事项

1. **登录状态保存**：登录信息保存在本地，请妥善保护
2. **合理使用**：请尊重创作者版权，仅供个人学习使用
3. **网络限制**：大量下载可能会面临 IP 限制，建议适当休息
4. **清晰度**：实际下载的清晰度取决于：
   - 登录状态（未登录最多 540p）
   - 视频本身支持的最高清晰度
   - 用户账号的会员等级

---

## 文件修改说明

新增和修改的文件：

1. **app/download.js** (新增)
   - CLI 下载的主要模块
   - 包含 URL 读取、视频获取、文件下载逻辑

2. **app/main.js** (修改)
   - 添加 CLI 模式检测
   - 条件化加载 UI 组件
   - 保持原有 UI 功能

3. **app/js/downloader.js** (修改)
   - 新增 `downloadFile()` 方法供 CLI 调用
   - 支持流式下载和断点续传

4. **video_urls.txt** (新增)
   - 示例 URL 文件

5. **CLI_USAGE.md** (新增)
   - 详细的 CLI 使用说明

---

## 反馈和改进

如遇问题，请检查：
- video_urls.txt 是否存在且格式正确
- URL 是否是有效的 B 站链接
- 登录状态是否有效
- 输出目录是否有写入权限

