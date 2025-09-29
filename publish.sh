#!/bin/bash

if [ -z "$1" ]; then
  echo "请指定版本类型: patch, minor, major"
  exit 1
fi

npm run screenshot:simple

if [ $? -ne 0 ]; then
  echo "截图失败，使用备选方案..."
  cp mind_map.png llm.png
fi

# 获取当前版本号
current_version=$(node -p "require('./package.json').version")

npm version $1

# 获取新版本号
new_version=$(node -p "require('./package.json').version")

npm run build

if [ $? -ne 0 ]; then
  echo "构建失败，取消发布"
  exit 1
fi
echo "提交更改..."
git add -u
git commit -m "Bump version to $new_version"
git push origin master --tags --force

if [ $? -eq 0 ]; then
  echo "发布流程已触发，请检查GitHub Actions查看发布状态"
else
  echo "Git推送失败，请手动检查"
fi

# 最后输出版本号
echo "发布版本: $new_version"