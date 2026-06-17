# 发布前检查清单

用于在推送 NPanel 到 GitHub，或准备公开仓库之前做最后检查。

## 仓库清洁

- [ ] 仓库中没有真实密码、真实 token、私钥或服务器地址
- [ ] `wrangler.jsonc` 使用的是占位 ID 或可公开配置
- [ ] `.gitignore` 已忽略本地日志、`.wrangler/`、`node_modules/`、`.dev.vars`
- [ ] 文档内容与当前代码行为一致

## 本地验证

- [ ] `npm.cmd test`
- [ ] `npx.cmd tsc --noEmit`
- [ ] 本地登录正常
- [ ] 节点新增、编辑、删除正常
- [ ] 分组新增、编辑、删除正常
- [ ] 订阅链接返回内容正常

## Cloudflare 准备

- [ ] 已创建 D1 数据库
- [ ] 已记录真实 `database_id`
- [ ] 已准备 `ADMIN_PASSWORD`
- [ ] 已准备 `SESSION_SECRET`
- [ ] 已执行或准备执行 `npm run db:remote:init`

## GitHub 准备

- [ ] 已确认仓库可见性
- [ ] 已确认默认分支
- [ ] 已确认远程仓库地址
- [ ] Cloudflare 已具备访问该 GitHub 仓库的权限

## 部署后检查

- [ ] 面板首页可正常打开
- [ ] 登录正常
- [ ] `/api/health` 返回期望的存储模式
- [ ] D1 数据可正常持久化
- [ ] `v2rayN` 订阅正常
- [ ] Clash 订阅正常
