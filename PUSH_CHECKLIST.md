# Release Checklist

Final checks before pushing NPanel to GitHub or making the repository public.

NPanel 推送或公开前的最终检查清单。

## Repository hygiene | 仓库清洁

- [ ] No real passwords, tokens, private keys, or server endpoints
- [ ] `wrangler.jsonc` uses placeholder IDs or release-safe values
- [ ] `.gitignore` excludes local logs, `.wrangler/`, `node_modules/`, `.dev.vars`
- [ ] Documentation matches the current code behavior

## Local validation | 本地验证

- [ ] `npm.cmd test`
- [ ] `npx.cmd tsc --noEmit`
- [ ] local login works
- [ ] node create/edit/delete works
- [ ] group create/edit/delete works
- [ ] subscription URLs return expected content

## Cloudflare readiness | Cloudflare 准备

- [ ] D1 database created
- [ ] real `database_id` recorded
- [ ] `ADMIN_PASSWORD` prepared
- [ ] `SESSION_SECRET` prepared
- [ ] `npm run db:remote:init` completed or scheduled

## GitHub readiness | GitHub 准备

- [ ] repository visibility decided
- [ ] default branch confirmed
- [ ] remote URL confirmed
- [ ] Cloudflare GitHub integration has access

## Deployment sanity check | 部署后检查

- [ ] panel homepage opens
- [ ] login succeeds
- [ ] `/api/health` reports the expected storage mode
- [ ] D1-backed data persists
- [ ] v2rayN subscription works
- [ ] Clash subscription works
