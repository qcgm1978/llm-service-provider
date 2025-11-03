#!/bin/bash
# 使用sudo执行发布，解决权限问题

# 确保使用官方registry
sudo npm config set registry https://registry.npmjs.org/

# 先登录
sudo npm login

# 使用sudo执行发布命令
sudo npm version patch
sudo npm publish --access public --force