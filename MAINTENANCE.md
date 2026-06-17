# Maintenance Guide

Routine operations for NPanel after deployment.

NPanel 上线后的日常维护说明。

## 1. Update code | 更新代码

```bash
git pull
npm install
npm test
npm run deploy
```

先拉代码、跑测试，再部署。

## 2. Rotate secrets | 更换密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

After rotating secrets, verify login again.

更换后重新验证登录是否正常。

## 3. Initialize a fresh database | 初始化新数据库

```bash
npm run db:remote:init
```

Use this only for a new D1 database or a new environment.

这一步只用于新的 D1 数据库或新环境。

## 4. Load demo data intentionally | 按需写入演示数据

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

This is destructive for demo-related rows and should not be part of routine production maintenance.

这会覆盖演示相关数据，不应作为常规生产维护步骤。

## 5. Local development storage modes | 本地开发存储模式

- `npm run dev`: mock mode
- `npm run dev:d1`: local D1 mode

`mock` 适合前端开发，`d1` 适合联调真实数据结构。

## 6. What to back up | 建议备份内容

- D1 exported data
- brand and settings values
- deployment notes
- secret management records stored outside the repository

建议备份 D1 数据、品牌设置和部署记录，但不要把真实密钥提交进仓库。
