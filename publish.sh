#!/bin/bash

# 确保脚本在出错时停止
set -e

# 检查是否提供了版本类型
type=$1
if [ -z "$type" ]; then
echo "请指定版本类型: patch, minor 或 major"
exit 1
fi

# 更新版本号并获取新版本
echo "更新 $type 版本..."
new_version=$(npm version $type --no-git-tag-version)
echo "新版本号: $new_version"

# 验证代码可构建
echo "验证构建..."
npm run build

# 提交更改
echo "提交更改..."
git add package.json
git commit -m "Bump version to $new_version"

# 创建标签
echo "创建标签..."
git tag v$new_version

# 推送代码和标签
echo "推送代码和标签..."
git push origin master
git push origin v$new_version

echo "发布流程已完成！GitHub Actions 将自动发布到 npmjs。"