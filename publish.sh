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

npm version $1

npm run build

if [ $? -ne 0 ]; then
  echo "构建失败，取消发布"
  exit 1
fi

git push origin main --tags

if [ $? -eq 0 ]; then
  echo "发布流程已触发，请检查GitHub Actions查看发布状态"
else
  echo "Git推送失败，请手动检查"
fi