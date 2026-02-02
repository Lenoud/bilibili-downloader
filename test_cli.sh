#!/bin/bash

echo "====== Bilibili 下载器 - 快速测试脚本 ======"
echo

# 检查依赖
echo "检查依赖..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装"
    exit 1
fi

if ! node -e "require('qrcode-terminal')" &> /dev/null; then
    echo "❌ qrcode-terminal 未安装，请运行: npm install qrcode-terminal"
    exit 1
fi

echo "✅ 依赖检查通过"
echo

# 测试帮助
echo "测试帮助信息..."
node cli.js --help | head -10
echo

# 测试登录（模拟）
echo "测试登录功能（将显示二维码）..."
echo "注意：这将显示真实的登录二维码，按Ctrl+C取消"
read -p "是否继续测试登录？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
     node cli.js --login
fi
echo

# 创建测试URL文件
echo "创建测试URL文件..."
cat > test_urls.txt << 'EOF'
https://www.bilibili.com/video/BV1xx411c7mD
EOF
echo "✅ 创建了 test_urls.txt"
echo

# 测试下载（不实际下载，只检查解析）
echo "测试下载解析功能..."
node -e "
const { CLIDownloader } = require('./cli');
const cli = new CLIDownloader();
console.log('✅ CLI模块加载成功');
console.log('✅ 可以读取URL文件:', cli.readUrlsFromFile('test_urls.txt').length, '个链接');
" 2>/dev/null && echo "✅ 下载器初始化成功" || echo "❌ 下载器初始化失败"

echo
echo "====== 测试完成 ======"
echo
echo "使用方法："
echo "  npm run login    # 登录"
echo "  npm run cli      # 下载"
echo "  node cli.js -h   # 帮助"