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
echo "当前版本: $current_version"

IFS='.' read -r major minor patch <<< "$current_version"

case "$1" in
  major)
    major=$((major + 1))
    minor=0
    patch=0
    ;;
  minor)
    minor=$((minor + 1))
    patch=0
    ;;
  patch)
    patch=$((patch + 1))
    ;;
  *)
    echo "版本类型无效"
    exit 1
    ;;
esac

new_version="$major.$minor.$patch"

sed -i '' "s/\"version\": \"$current_version\"/\"version\": \"$new_version\"/g" package.json


npm run build

if [ $? -ne 0 ]; then
  echo "构建失败，取消发布"
  exit 1
fi
echo "提交更改..."
git add -u
git commit -m "Bump version to $new_version"
git tag -a "v$new_version" -m "Version $new_version"
git push origin master --tags --force

if [ $? -eq 0 ]; then
  echo "发布流程已触发，请检查GitHub Actions查看发布状态"
else
  echo "Git推送失败，请手动检查"
fi

echo "发布版本: $new_version"