# 后期维护

本文用于记录 NPanel 上线后的常见维护操作。

## 1. 更新代码

```bash
git pull
npm install
npm test
npm run deploy
```

建议顺序是：先拉代码，再安装依赖，跑测试确认无误后再部署。

## 2. 更换密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

更换后建议立即验证一次登录是否正常。

## 3. 初始化新的数据库

```bash
npm run db:remote:init
```

这一步只用于新的 D1 数据库，或者新的部署环境，不需要在每次更新时重复执行。

## 4. 按需写入演示数据

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

这一步会覆盖演示相关数据，不应作为日常生产维护动作。

## 5. 本地开发模式

- `npm run dev`：本地 mock 模式
- `npm run dev:d1`：本地 D1 模式

一般来说：

- `mock` 适合前端界面开发
- `d1` 适合联调真实数据结构

## 6. 建议备份内容

建议备份以下内容：

- D1 导出的数据
- 品牌名和面板设置
- 部署记录
- 放在仓库外部的密钥管理记录

不要把真实密钥直接提交到仓库中。
