# 后期维护

这份文档用于统一 `NPanel` 的日常更新、依赖升级、部署验证和异常回退动作。

## 一、日常更新流程

适用于普通功能修改、界面调整、文档更新、小版本依赖升级。

```bash
git pull
npm install
npm audit
npm test -- --run
npx tsc --noEmit
```

建议顺序：

1. 先拉最新代码，避免在旧基础上继续改。
2. 安装依赖后先看 `npm audit`，确认没有新增漏洞。
3. 运行测试和类型检查，确认改动没有把基础逻辑带偏。
4. 如改动涉及界面、订阅输出、登录流程，再做一次本地手动验证。

## 二、本地验证建议

### 1. 纯界面或文档改动

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:8787
```

适合检查：

- 登录页是否正常
- 主题切换和品牌名显示是否正常
- 节点与分组表单是否正常展开/收起
- 导出按钮、二维码弹窗、筛选交互是否正常

### 2. 涉及 D1、订阅、数据结构的改动

```bash
npm run db:local:init
npm run db:local:seed
npm run dev:d1
```

打开：

```text
http://127.0.0.1:8788
```

适合检查：

- `/api/health` 是否返回 `storageMode: "d1"`
- 节点和分组是否能正常保存
- 订阅输出内容是否正常
- 检测记录是否能正常写入

## 三、依赖升级流程

适用于 `wrangler`、`vitest`、`typescript`、Cloudflare 相关依赖更新。

建议固定顺序：

```bash
npm install
npm audit
npm test -- --run
npx tsc --noEmit
```

如果升级后 `npm audit` 仍有漏洞：

1. 先看是不是直接依赖版本过旧。
2. 如果是传递依赖问题，再评估是否用 `overrides` 固定版本。
3. 只有在测试和类型检查都通过后再提交锁文件。

## 四、部署前检查

推送或部署前至少确认下面几项：

- 没有真实密码、真实 token、真实服务器地址、真实私钥
- `wrangler.jsonc` 中使用的是可公开配置或占位配置
- 文档与当前代码行为一致
- `npm audit` 为 0 或已经明确接受风险
- `npm test -- --run` 通过
- `npx tsc --noEmit` 通过

更细的发布检查见：

- [PUSH_CHECKLIST.md](PUSH_CHECKLIST.md)

## 五、部署动作

```bash
npm run deploy
```

如果是新环境，部署前还需要先完成：

```bash
npm run db:remote:init
wrangler secret put ADMIN_PASSWORD
wrangler secret put SESSION_SECRET
```

## 六、部署后回归

建议部署后至少检查：

- 面板首页可正常打开
- 管理员登录正常
- `/api/health` 返回符合预期
- 节点新增、编辑、删除正常
- 分组新增、编辑、删除正常
- `v2rayN` 订阅正常
- Clash 订阅正常

## 七、演示数据注意事项

本仓库保留了演示 seed 流程，但它不是日常生产维护动作。

```bash
npm run db:remote:seed:demo -- --confirm-remote-demo-seed
```

这条命令只适合：

- 新建演示环境
- 重置公开展示站
- 测试文档中的演示流程

不适合直接对生产数据执行。

## 八、异常回退思路

如果更新后出现问题，先按下面顺序收敛：

1. 先看最近一次改动是否只涉及前端、依赖还是数据库。
2. 用 `git diff` 和 `git log` 缩小范围。
3. 如是依赖问题，优先回退 `package.json` 和 `package-lock.json`。
4. 如是部署配置问题，先核对 `wrangler.jsonc`、D1 绑定和 secrets。
5. 如是数据问题，不要直接在远程库里反复写 seed。

## 九、推荐维护节奏

- 小改动：改完当天自测并推送
- 依赖更新：集中处理，做完整审计和测试
- 文档更新：跟功能改动一起提交，避免说明过期
- 发布前：按 [PUSH_CHECKLIST.md](PUSH_CHECKLIST.md) 走一遍
