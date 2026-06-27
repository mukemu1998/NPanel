# GitHub + Cloudflare 部署流程

本文适用于将 `NPanel` 放在 GitHub 仓库中，并通过 Cloudflare Workers 部署。

## 前置条件

- Node.js 22 或更高版本
- 已安装 `wrangler`
- 已拥有 Cloudflare 账号
- 已准备 GitHub 仓库

## 1. 创建 D1 数据库

```bash
wrangler d1 create npanel
```

记录返回结果中的：

- `database_id`
- `preview_database_id`

## 2. 更新 Wrangler 配置

打开 `wrangler.jsonc`，将 D1 绑定中的占位值替换为你自己的数据库 ID：

```jsonc
"database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

如需保留预览环境，也同步更新 `preview_database_id`。

## 3. 初始化远程数据库结构

```bash
npm run db:remote:init
```

这一步会在远程 D1 中创建面板运行所需的表结构。

## 4. 配置生产密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

建议：

- `ADMIN_PASSWORD` 使用真实后台密码
- `SESSION_SECRET` 使用足够长的随机字符串

## 5. 部署 Worker

```bash
npm run deploy
```

如果你通过 GitHub 集成 Cloudflare 自动部署，推荐配置：

- `Production branch`: `main`
- `Root directory`: 留空
- `Build command`: 留空
- `Deploy command`: `npm run deploy`

## 6. 部署后验证

建议至少检查以下内容：

1. 首页可以正常打开
2. 管理员登录正常
3. `/api/health` 返回符合预期
4. 节点和分组可以正常保存
5. `v2rayN` 订阅输出正常
6. Clash YAML 输出正常

## 7. 可选的演示数据

只有在明确需要公开演示环境时，才执行：

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

这一步会覆盖演示相关数据，不属于常规生产部署流程。

## 8. 流量边界说明

适合放在 Cloudflare 后面的内容：

- 面板网页
- 管理 API
- 订阅分发入口

不建议放在 Cloudflare 代理后面的内容：

- 真实代理节点域名
- 中转入口域名
- 客户端实际连接的代理 IP

也就是说，Cloudflare 只承载“管理与分发”，不承载真实代理流量。
