#!/bin/bash
# 简单的发布脚本，绕过npm缓存权限问题

# 确保使用官方registry
npm config set registry https://registry.npmjs.org/

# 更新版本号（补丁版本+1）
npm version patch

# 直接发布，使用npx来避免权限问题
npx npm-cli-login
npx npm publish --access public --force

# 恢复淘宝镜像
npm config set registry https://registry.npmmirror.com/

