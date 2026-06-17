# GitHub + Cloudflare 部署流程

本文适用于将 NPanel 放在 GitHub 仓库中，并通过 Cloudflare Workers 进行自动部署。

## 1. 准备仓库文件

建议提交这些内容：

- `src/`
- `public/`
- `database/`
- `scripts/`
- `test/`
- `package.json`
- `package-lock.json`
- `wrangler.jsonc`
- `wrangler.local.jsonc`
- `.dev.vars.example`
- 项目说明文档

不要提交这些内容：

- `node_modules/`
- `.wrangler/`
- `.dev.vars`
- `.env`
- 本地日志文件

## 2. 创建 D1 数据库

```bash
wrangler d1 create npanel
```

创建完成后，记录返回结果中的：

- `database_id`
- `preview_database_id`（如果需要预览环境）

## 3. 修改 Wrangler 配置

打开 `wrangler.jsonc`，把下面的占位值替换成自己的真实 D1 数据库 ID：

```jsonc
"database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

## 4. 初始化远程数据库结构

```bash
npm run db:remote:init
```

这一步会在远程 D1 中创建面板运行所需的数据表。

## 5. 配置密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

建议规则：

- `ADMIN_PASSWORD` 使用真实后台密码
- `SESSION_SECRET` 使用足够长的随机字符串

## 6. 推送到 GitHub

首次推送示例：

```bash
git init
git add .
git commit -m "init npanel"
git branch -M main
git remote add origin https://github.com/your-account/NPanel.git
git push -u origin main
```

把仓库地址替换成自己的 GitHub 仓库地址即可。

## 7. 在 Cloudflare 连接仓库

操作路径：

1. 打开 `Workers & Pages`
2. 点击 `Create application`
3. 选择 `Import a repository`
4. 连接 GitHub
5. 选择目标仓库

## 8. 构建设置

推荐配置如下：

- `Production branch`：`main`
- `Root directory`：留空
- `Build command`：留空
- `Deploy command`：`npm run deploy`

本项目不需要额外的前端打包步骤，直接从仓库根目录部署即可。

## 9. 可选演示数据

只有在明确需要写入演示数据时才执行：

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

之所以需要额外确认，是因为这一步会覆盖演示相关数据，而且不属于正常生产部署流程。

## 10. 自定义域名边界

适合放在 Cloudflare 后面的内容：

- 面板网页
- 管理 API
- 订阅分发入口

不建议放在 Cloudflare 橙云后面的内容：

- 真实代理节点域名
- 中转入口域名
- 客户端实际连接的代理 IP

也就是说，Cloudflare 只承载“管理和分发”，不承载真实代理流量。

## 11. 上线检查

建议按下面顺序检查：

1. 打开面板首页
2. 确认可以正常登录
3. 检查 `/api/health`
4. 新建测试节点
5. 新建测试分组
6. 打开订阅链接
7. 使用客户端导入订阅验证
