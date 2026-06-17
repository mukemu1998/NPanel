# 常用操作备忘单

这份文档只保留最常用、最短路径的操作顺序，适合日常更新时快速查看。

## 1. 拉最新代码

```bash
git pull
```

## 2. 安装依赖

```bash
npm install
```

## 3. 看安全审计

```bash
npm audit
```

## 4. 跑测试

```bash
npm test -- --run
```

## 5. 跑类型检查

```bash
npx tsc --noEmit
```

## 6. 只看界面时本地预览

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:8787
```

## 7. 涉及 D1 时本地联调

```bash
npm run db:local:init
npm run db:local:seed
npm run dev:d1
```

打开：

```text
http://127.0.0.1:8788
```

## 8. 新环境首次初始化远程数据库

```bash
npm run db:remote:init
```

只在新环境或新数据库首次上线前执行，不是每次更新都要跑。

## 9. 配置生产密钥

```bash
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

## 10. 部署

```bash
npm run deploy
```

## 11. 推送前最后确认

重点看：

- 没有真实密码、真实 token、真实服务器地址
- `npm audit` 没问题
- 测试和类型检查通过
- 文档与代码行为一致

完整清单见：

- [PUSH_CHECKLIST.md](PUSH_CHECKLIST.md)

## 12. 最常用顺序

日常小更新通常直接按这个顺序走：

```bash
git pull
npm install
npm audit
npm test -- --run
npx tsc --noEmit
npm run deploy
```
