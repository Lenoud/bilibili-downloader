#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const fetch = require('node-fetch');
const { CookieJar } = require('tough-cookie');

// 导入下载器相关模块
const { Downloader } = require('./app/js/downloader');
const LoginHelper = require('./app/js/login/login-helper');

// CLI 登录服务
class CLILoginService {
    constructor() {
        this.tokenSource = { token: false };
    }

    async login() {
        try {
            console.log('正在获取登录二维码...');

            const loginUrl = await this.getLoginUrl();
            if (!loginUrl || loginUrl.code !== 0) {
                console.error('获取登录URL失败');
                return false;
            }

            if (!loginUrl.data || !loginUrl.data.url) {
                console.error('登录URL数据无效');
                return false;
            }

            // 生成并显示二维码
            await this.displayQRCode(loginUrl.data.url);

            // 等待登录状态
            const success = await this.getLoginStatus(loginUrl.data.qrcode_key);

            if (success) {
                console.log('✓ 登录成功！');
                return true;
            } else {
                console.log('✗ 登录失败或超时');
                return false;
            }

        } catch (e) {
            console.error(`登录异常: ${e}`);
            return false;
        }
    }

    async getLoginUrl() {
        try {
            const response = await fetch('https://passport.bilibili.com/x/passport-login/web/qrcode/generate');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('获取登录URL异常:', error);
            return null;
        }
    }

    async displayQRCode(url) {
        try {
            // 生成并显示终端二维码
            console.log('\n' + '='.repeat(50));
            console.log('请使用哔哩哔哩APP扫描下方二维码登录：');
            console.log('='.repeat(50));
            qrcode.generate(url, { small: true });
            console.log('='.repeat(50));
            console.log('等待扫码中...\n');

        } catch (error) {
            console.error('生成二维码异常:', error);
        }
    }

    async getLoginStatus(oauthKey) {
        const maxAttempts = 300; // 5分钟超时
        let attempts = 0;

        while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;

            try {
                const response = await fetch(`https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=${oauthKey}`);
                const loginStatus = await response.json();

                if (!loginStatus) {
                    continue;
                }

                switch (loginStatus.data.code) {
                    case 86038:
                        console.log('二维码已过期，请重新运行程序');
                        this.tokenSource.token = true;
                        return false;

                    case 86101:
                        // 未扫码，继续等待
                        if (attempts % 5 === 0) {
                            console.log(`等待扫码中... (${Math.floor(attempts / 60)}分${attempts % 60}秒)`);
                        }
                        break;

                    case 86090:
                        // 已扫码，未确认
                        console.log('已扫码，请在手机上确认登录...');
                        break;

                    case 0:
                        // 确认登录
                        try {
                            const isSucceed = await LoginHelper.saveLoginInfoCookies(loginStatus.data.url);
                            if (!isSucceed) {
                                console.error('保存登录信息失败');
                                return false;
                            }
                            return true;
                        } catch (e) {
                            console.error(`保存登录信息异常: ${e}`);
                            return false;
                        }

                    default:
                        console.log(`未知状态码: ${loginStatus.data.code} - ${loginStatus.data.message}`);
                        break;
                }

                if (this.tokenSource.token) {
                    break;
                }
            } catch (error) {
                console.error(`检查登录状态异常: ${error}`);
            }
        }

        console.log('登录超时');
        return false;
    }
}

// CLI 下载器
class CLIDownloader {
    constructor() {
        this.loginService = new CLILoginService();
    }

    // 读取视频URL文件
    readUrlsFromFile(filePath) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`文件不存在: ${filePath}`);
        }
        return fs.readFileSync(filePath, 'utf-8')
            .split('\n')
            .map(url => url.trim())
            .filter(url => url && url.startsWith('http'));
    }

    // 非UI方式下载视频
    async downloadVideoNonUI(videoUrl, outputDir) {
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

            // 创建视频专用文件夹
            const videoDir = path.join(outputDir, downloader.uniqueName);
            if (!fs.existsSync(videoDir)) {
                fs.mkdirSync(videoDir, { recursive: true });
            }

            // 下载所有文件（视频、音频等）
            for (const item of items) {
                try {
                    const fileName = this.generateFileName(item);
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
    }

    // 生成文件名，避免重复
    generateFileName(item) {
        const type = item.type;
        const quality = item.quality || 'unknown';
        const codecs = item.codecs ? item.codecs.replace(/[\.\/]/g, '_') : 'unknown';
        const bandwidth = item.bandwidth ? Math.round(item.bandwidth / 1000) + 'k' : 'unknown';
        const mimeType = item.mimeType.split('/')[1];

        return `${type}_${quality}_${codecs}_${bandwidth}.${mimeType}`;
    }

    // 批量下载主函数
    async main(urlFile, outputDir) {
        try {
            console.log('====== Bilibili 视频下载器 (CLI模式) ======');

            // 检查登录状态
            console.log('\n检查登录状态...');
            const cookies = LoginHelper.getLoginInfoCookies();
            if (!cookies) {
                console.log('⚠ 未登录状态 - 只能下载标清视频');
                console.log('是否现在登录？(y/N): ');

                // 简单的输入处理
                process.stdin.setEncoding('utf8');
                process.stdin.on('data', async (input) => {
                    const answer = input.trim().toLowerCase();
                    if (answer === 'y' || answer === 'yes') {
                        const loginSuccess = await this.loginService.login();
                        if (loginSuccess) {
                            await this.continueDownload(urlFile, outputDir);
                        } else {
                            console.log('跳过登录，继续下载...');
                            await this.continueDownload(urlFile, outputDir);
                        }
                    } else {
                        console.log('跳过登录，继续下载...');
                        await this.continueDownload(urlFile, outputDir);
                    }
                    process.stdin.end();
                });
            } else {
                console.log('✓ 已登录状态');
                await this.continueDownload(urlFile, outputDir);
            }

        } catch (error) {
            console.error('错误:', error.message);
            process.exit(1);
        }
    }

    async continueDownload(urlFile, outputDir) {
        // 读取URL列表
        const urls = this.readUrlsFromFile(urlFile);
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
            const success = await this.downloadVideoNonUI(urls[i], outputDir);
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
    }
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    let urlFile = 'video_urls.txt';
    let outputDir = 'downloads';
    let loginOnly = false;

    // 解析命令行参数
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--urls':
            case '-u':
                urlFile = args[++i];
                break;
            case '--output':
            case '-o':
                outputDir = args[++i];
                break;
            case '--login':
            case '-l':
                loginOnly = true;
                break;
            case '--help':
            case '-h':
                showHelp();
                return;
        }
    }

    const cliDownloader = new CLIDownloader();

    if (loginOnly) {
        // 仅登录模式
        cliDownloader.loginService.login().then(success => {
            if (success) {
                console.log('登录完成，可以开始下载了');
            }
            process.exit(success ? 0 : 1);
        });
    } else {
        // 下载模式
        cliDownloader.main(urlFile, outputDir);
    }
}

function showHelp() {
    console.log(`
Bilibili 视频下载器 - CLI 版本

用法:
  node cli.js [选项]

选项:
  -u, --urls <文件>     指定URL文件路径 (默认: video_urls.txt)
  -o, --output <目录>   指定输出目录 (默认: downloads)
  -l, --login           仅执行登录操作
  -h, --help            显示帮助信息

示例:
  node cli.js                                    # 使用默认设置下载
  node cli.js -u my_urls.txt -o ./videos         # 指定URL文件和输出目录
  node cli.js --login                            # 仅登录
  node cli.js --help                             # 显示帮助

URL文件格式:
  每行一个B站视频链接，例如:
  https://www.bilibili.com/video/BV1xxx
  https://www.bilibili.com/video/BV2xxx
`);
}

// 如果直接运行此文件
if (require.main === module) {
    main();
}

module.exports = { CLIDownloader, CLILoginService };