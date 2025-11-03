#!/bin/bash
# 简单的发布脚本，绕过npm缓存权限问题

# 确保使用官方registry
# npm config set registry https://registry.npmjs.org/

# 直接发布，使用npx来避免权限问题
npx npm-cli-login
npx npm publish --access public --force