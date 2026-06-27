# Changelog

All notable changes to `NPanel` will be documented in this file.

The format is intentionally lightweight and focused on changes that affect usage, deployment, or repository structure.

## Unreleased

### Changed

- Simplified the repository documentation structure for a cleaner open source layout
- Kept only the core project documents: `README.md`, deployment guide, changelog, and license
- Moved quick-start, repository overview, and open-source boundary notes into `README.md`
- Reduced deployment notes to the essential Cloudflare Workers + D1 workflow

## 0.1.0 - 2026-06-18

### Added

- Initial open source repository split for `NPanel`
- Cloudflare Workers worker, front-end panel, D1 schema, and regression tests
- Subscription export for `v2rayN` and Clash clients
- Local `mock` storage fallback and local D1 development workflow

### Changed

- Cleaned repository naming and removed non-public project content
- Added public demo data, screenshots, and deployment-oriented project documentation

### Security

- Updated key dependencies and pinned vulnerable transitive packages via `overrides`
