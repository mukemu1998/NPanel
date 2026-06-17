# Deploy with GitHub + Cloudflare

GitHub-connected deployment guide for NPanel.

NPanel 的 GitHub + Cloudflare 自动部署流程。

## 1. Prepare the repository | 准备仓库

Commit these files:

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
- documentation files

Do not commit these files:

- `node_modules/`
- `.wrangler/`
- `.dev.vars`
- `.env`
- local logs

提交这些文件，忽略本地依赖、私密环境变量和日志文件。

## 2. Create D1 | 创建 D1

```bash
wrangler d1 create npanel
```

Save:

- `database_id`
- `preview_database_id` if you want a preview binding

记录 Cloudflare 返回的数据库 ID，后面要填回配置文件。

## 3. Update Wrangler config | 修改 Wrangler 配置

Open `wrangler.jsonc` and replace:

```jsonc
"database_id": "REPLACE_WITH_YOUR_D1_DATABASE_ID"
```

with your real D1 database id.

把占位值替换成自己的真实 D1 ID。

## 4. Initialize remote schema | 初始化远程表结构

```bash
npm run db:remote:init
```

This creates the required tables in remote D1.

这一步会在远程 D1 中创建面板所需表结构。

## 5. Configure secrets | 配置密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

Requirements:

- `ADMIN_PASSWORD`: real admin password
- `SESSION_SECRET`: long random string

要求：

- `ADMIN_PASSWORD` 使用真实后台密码
- `SESSION_SECRET` 使用足够长的随机字符串

## 6. Push to GitHub | 推送到 GitHub

Example:

```bash
git init
git add .
git commit -m "init tz panel"
git branch -M main
git remote add origin https://github.com/your-account/NPanel.git
git push -u origin main
```

把远程仓库地址替换成自己的 GitHub 仓库地址即可。

## 7. Connect the repo in Cloudflare | 在 Cloudflare 连接仓库

Path:

1. Open `Workers & Pages`
2. Click `Create application`
3. Choose `Import a repository`
4. Connect GitHub
5. Select the target repository

路径如上，连接 GitHub 后选择目标仓库即可。

## 8. Build settings | 构建设置

Recommended values:

- `Production branch`: `main`
- `Root directory`: leave empty
- `Build command`: leave empty
- `Deploy command`: `npm run deploy`

推荐保持根目录部署，不额外添加构建命令。

## 9. Optional demo seed | 可选演示数据

Only run this when you intentionally want demo content:

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

Why it is guarded:

- it overwrites demo-related rows
- it is not part of the normal production path
- it requires an explicit confirmation flag

只有明确要写入演示数据时才执行，这不是正常生产部署步骤。

## 10. Custom domain boundary | 自定义域名边界

Good behind Cloudflare:

- panel UI
- admin API
- subscription delivery

Do not orange-cloud these:

- real proxy node domains
- relay entry domains
- actual client-facing proxy IPs

适合放在 Cloudflare 后面的只有面板网页、管理 API 和订阅分发；真实代理流量入口不要放在 Cloudflare 橙云后面。

## 11. Final verification | 上线检查

1. Open the panel homepage
2. Log in successfully
3. Check `/api/health`
4. Create a test node
5. Create a test group
6. Open a subscription URL
7. Import the subscription in a client

按上面的顺序做一轮联通性和功能验证即可。
