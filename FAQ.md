# FAQ

Common questions about NPanel.

NPanel 常见问题。

## Why does remote login return `503`? | 为什么远程登录返回 `503`？

Usually because one of these is missing:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- D1 binding in the deployed Worker

通常是 `ADMIN_PASSWORD`、`SESSION_SECRET` 或 D1 绑定缺失。

## Why does `/api/health` show `mock`? | 为什么 `/api/health` 显示 `mock`？

The Worker is running without a D1 binding.

表示当前实例没有绑定 D1。

## Can real proxy traffic go through Cloudflare? | 真实代理流量可以走 Cloudflare 吗？

Not recommended for this project design.

NPanel is meant to distribute subscriptions and manage metadata. Real proxy traffic should go directly to your servers or relay entries.

不建议。这个项目的设计目标是管理和分发订阅，不是承载真实代理流量。

## Is the demo seed safe for production? | 演示 seed 适合生产吗？

No. It is only for sample content and testing.

不适合。它只用于示例和测试。

## Can the default brand name be changed? | 默认品牌名可以改吗？

Yes. You can change it in the UI settings after login, or edit `public/panel-config.js` for the default public value.

可以。登录后可在 UI 里修改，也可以直接改 `public/panel-config.js` 作为默认公开值。

## Why do some Clash clients still show their own imported profile name? | 为什么有些 Clash 客户端仍显示自己的导入名？

Some clients control the imported profile label on their own side, especially for URL imports.

This panel can shape the subscription content and headers, but some client UIs may still choose their own local display name behavior.

一些客户端，尤其是 URL 导入场景，会自己决定本地配置名称显示；服务端无法完全统一所有客户端行为。
