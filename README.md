# NPanel

基于 Cloudflare Workers 的节点与订阅管理面板。

![NPanel Dashboard](docs/assets/dashboard-overview.png)

## 简介

`NPanel` 用于集中管理节点、分组和订阅分发，并提供适合 `v2rayN` 与 Clash 类客户端使用的订阅输出。

项目目标是提供一套可自托管、可二次定制、默认不包含私人环境信息的开源面板骨架。

## 功能

- 管理员登录与会话控制
- 节点与分组的增删改查
- `v2rayN` 订阅导出
- Clash YAML 订阅导出
- Worker 发起 TCP 可达性检查
- D1 持久化存储
- 未绑定 D1 时的本地 `mock` 存储回退
- 品牌名与主题外观自定义

## 界面预览

### 概览

![Dashboard](docs/assets/dashboard-overview.png)

### 节点编辑

![Node Editor](docs/assets/node-editor.png)

### 分组编辑

![Group Editor](docs/assets/group-editor.png)

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地预览

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:8787
```

如果本地没有配置 `ADMIN_PASSWORD`，开发环境默认密码为：

```text
change-me
```

如需自定义本地密钥，可从 `.dev.vars.example` 复制生成 `.dev.vars`。

### 3. 本地 D1 联调

```bash
npm run db:local:init
npm run db:local:seed
npm run dev:d1
```

打开：

```text
http://127.0.0.1:8788
```

### 4. 运行测试

```bash
npm test -- --run
```

## 部署

生产部署建议顺序：

1. 创建 D1 数据库
2. 更新 `wrangler.jsonc` 中的 D1 绑定
3. 初始化远程数据库结构
4. 配置 `ADMIN_PASSWORD`
5. 配置 `SESSION_SECRET`
6. 部署 Worker

完整说明见 [DEPLOY_GITHUB_CLOUDFLARE.md](DEPLOY_GITHUB_CLOUDFLARE.md)。

## 仓库结构

- `src/`：Worker 入口、鉴权、订阅生成、存储层
- `public/`：前端静态资源
- `database/`：D1 初始化与迁移脚本
- `scripts/`：辅助脚本与示例脚本
- `test/`：Vitest 回归测试
- `docs/assets/`：README 截图资源

## 开源边界

- 仓库仅保留公开示例数据与占位配置
- 不应提交真实密钥、真实数据库 ID、真实节点参数或真实服务器地址
- Cloudflare 只适合承载面板网页、管理 API 与订阅分发
- 实际代理流量应直接连接 VPS 或中转入口，不应穿过 Cloudflare 代理

## 文档

- [DEPLOY_GITHUB_CLOUDFLARE.md](DEPLOY_GITHUB_CLOUDFLARE.md)：部署流程
- [CHANGELOG.md](CHANGELOG.md)：变更记录

## 许可证

本项目使用 `MIT License`。详见 [LICENSE](LICENSE)。
