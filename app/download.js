const fs = require('fs');
const path = require('path');
const { Downloader } = require('./js/downloader');
const LoginHelper = require('./js/login/login-helper');

// 读取视频URL文件
const readUrlsFromFile = (filePath) => {
    if (!fs.existsSync(filePath)) {
        throw new Error(`文件不存在: ${filePath}`);
    }
    return fs.readFileSync(filePath, 'utf-8')
        .split('\n')
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http'));
};

// 非UI方式下载视频
const downloadVideoNonUI = async (videoUrl, outputDir) => {
    try {
        console.log(`\n正在处理: ${videoUrl}`);
        
        const downloader = new Downloader();
        
        // 获取视频信息
        const success = await downloader.getPlayUrlWebPage(videoUrl);
        if (!success) {
            console.error(`  ✗ 无法获取视频信息`);
            return false;
        }

        // 获取下载项
        const { quality, items } = downloader.getDownloadItems();
        console.log(`  ✓ 视频标题: ${downloader.uniqueName}`);
        console.log(`  ✓ 清晰度: ${quality}`);

        // 创建视频专用文件夹 - 添加分P号和CID以避免重名
        const folderName = downloader.pid > 1 
            ? `${downloader.uniqueName}_P${downloader.pid}` 
            : downloader.uniqueName;
        const videoDir = path.join(outputDir, folderName);
        if (!fs.existsSync(videoDir)) {
            fs.mkdirSync(videoDir, { recursive: true });
        }

        // 下载所有文件（视频、音频等）
        for (const item of items) {
            try {
                // 生成唯一的文件名，包含编码格式和码率以避免同名覆盖
                let fileName;
                if (item.type === 'video') {
                    // 视频文件：分辨率_编码格式_码率
                    fileName = `${item.type}_${item.quality}_${item.codecs}_${item.bandwidth}.${item.mimeType.split('/')[1]}`;
                } else {
                    // 音频文件：编码格式_码率
                    fileName = `${item.type}_${item.codecs}_${item.bandwidth}.${item.mimeType.split('/')[1]}`;
                }
                await downloader.downloadFile(item.baseUrl, path.join(videoDir, fileName));
                console.log(`  ✓ 已下载: ${fileName}`);
            } catch (error) {
                console.error(`  ✗ 下载失败 ${item.type}: ${error.message}`);
            }
        }

        console.log(`  ✓ 下载完成: ${videoDir}`);
        return true;
    } catch (error) {
        console.error(`  ✗ 处理失败: ${error.message}`);
        return false;
    }
};

// 批量下载主函数
const main = async (urlFile, outputDir) => {
    try {
        console.log('====== Bilibili 视频下载器 (非UI模式) ======');
        
        // 验证登录状态
        console.log('\n检查登录状态...');
        const cookies = LoginHelper.getLoginInfoCookies();
        if (cookies) {
            console.log('✓ 已登录状态');
        } else {
            console.log('⚠ 未登录状态 - 只能下载标清视频');
        }

        // 读取URL列表
        const urls = readUrlsFromFile(urlFile);
        console.log(`\n找到 ${urls.length} 个视频链接\n`);

        // 创建输出目录
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // 下载每个视频
        let successCount = 0;
        let failureCount = 0;

        for (let i = 0; i < urls.length; i++) {
            console.log(`[${i + 1}/${urls.length}]`);
            const success = await downloadVideoNonUI(urls[i], outputDir);
            if (success) {
                successCount++;
            } else {
                failureCount++;
            }
        }

        // 统计信息
        console.log('\n====== 下载完成 ======');
        console.log(`成功: ${successCount}, 失败: ${failureCount}`);
        console.log(`输出目录: ${path.resolve(outputDir)}`);

    } catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    }
};

module.exports = { downloadVideoNonUI, main };

// 如果直接运行此文件
if (require.main === module) {
    const urlFile = process.argv[2] || 'video_urls.txt';
    const outputDir = process.argv[3] || 'downloads';
    main(urlFile, outputDir);
}
