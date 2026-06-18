const THEME_STORAGE_KEY = "npanel-theme-v1";

const PANEL_CONFIG = {
	brand: "NPanel",
	...(window.NPANEL_CONFIG || {}),
};

const THEME_OPTIONS = {
	mono: {
		label: "黑白",
		description: "黑白灰单色系，最克制、最中性，也作为默认配色风格。",
		presets: [
			{ id: "graphite", name: "石墨黑白", note: "黑白灰单配色", swatches: ["0 0% 92%", "0 0% 72%", "0 0% 48%", "0 0% 24%"] },
		],
	},
	neon: {
		label: "冷光霓虹",
		description: "当前这套默认配色属于冷光霓虹，特点是深底、冷色主光和科技感撞色。",
		presets: [
			{ id: "aurora", name: "极光青紫", note: "当前默认", swatches: ["194 100% 65%", "156 81% 63%", "35 100% 71%", "263 100% 77%"] },
			{ id: "glacier", name: "冰川蓝银", note: "更冷静、更克制", swatches: ["202 95% 68%", "173 63% 70%", "213 47% 79%", "242 69% 82%"] },
			{ id: "lagoon", name: "深海青绿", note: "偏海洋与运维感", swatches: ["182 88% 58%", "149 64% 58%", "201 83% 66%", "233 67% 72%"] },
			{ id: "volt", name: "霜电蓝紫", note: "更强电感和速度感", swatches: ["214 100% 67%", "266 95% 75%", "186 78% 62%", "324 81% 74%"] },
			{ id: "magenta", name: "星云洋红", note: "冷色里混一点舞台感", swatches: ["319 90% 71%", "278 85% 76%", "202 94% 69%", "347 88% 75%"] },
			{ id: "amber", name: "量子琥珀", note: "蓝青主轴里加入暖色高亮", swatches: ["37 100% 69%", "159 73% 63%", "14 92% 71%", "218 91% 73%"] },
		],
	},
	macaron: {
		label: "马卡龙",
		description: "柔和浅甜、低压感更强，并且每个选项都采用单一色相的同色阶马卡龙。",
		presets: [
			{ id: "berry", name: "奶霜红", note: "红系单色阶", swatches: ["353 94% 86%", "353 90% 82%", "353 84% 76%", "353 78% 70%"] },
			{ id: "peach", name: "蜜桃橙", note: "橙系单色阶", swatches: ["24 100% 87%", "24 97% 82%", "24 91% 76%", "24 84% 70%"] },
			{ id: "lemon", name: "奶油黄", note: "黄系单色阶", swatches: ["49 100% 88%", "49 100% 83%", "49 95% 77%", "49 88% 70%"] },
			{ id: "mint", name: "薄荷绿", note: "绿系单色阶", swatches: ["146 78% 87%", "146 72% 82%", "146 66% 76%", "146 60% 69%"] },
			{ id: "teal", name: "海盐青", note: "青系单色阶", swatches: ["184 82% 88%", "184 76% 83%", "184 69% 77%", "184 62% 70%"] },
			{ id: "sky", name: "云雾蓝", note: "蓝系单色阶", swatches: ["211 100% 89%", "211 96% 84%", "211 90% 78%", "211 82% 71%"] },
			{ id: "grape", name: "葡萄紫", note: "紫系单色阶", swatches: ["272 88% 89%", "272 83% 84%", "272 77% 78%", "272 70% 71%"] },
			{ id: "sakura", name: "樱花粉", note: "粉系单色阶", swatches: ["332 100% 89%", "332 95% 84%", "332 88% 78%", "332 80% 71%"] },
		],
	},
};

const DEFAULT_THEME = {
	mode: "dark",
	family: "mono",
	palette: "graphite",
};

const THEME_MODES = [
	{ id: "system", label: "跟随系统", note: "自动使用系统明暗" },
	{ id: "dark", label: "暗色", note: "默认黑底" },
	{ id: "light", label: "浅色", note: "默认白底" },
];

const state = {
	authenticated: false,
	authConfigured: false,
	usingDevAuthFallback: false,
	brand: PANEL_CONFIG.brand,
	nodes: [],
	groups: [],
	checks: [],
	summary: {
		nodeCount: 0,
		groupCount: 0,
		activeNodeCount: 0,
		storageMode: "mock",
		lastCheckAt: null,
	},
	nodeImportCandidates: [],
	nodeEditorOpen: false,
	groupEditorOpen: false,
	theme: { ...DEFAULT_THEME },
	themeDraft: { ...DEFAULT_THEME },
};

const els = {
	loginPanel: document.querySelector("#login-panel"),
	appPanel: document.querySelector("#app-panel"),
	loginForm: document.querySelector("#login-form"),
	passwordInput: document.querySelector("#password-input"),
	logoutButton: document.querySelector("#logout-button"),
	themeSettingsButton: document.querySelector("#theme-settings-button"),
	exportButton: document.querySelector("#export-button"),
	refreshButton: document.querySelector("#refresh-button"),
	runChecksButton: document.querySelector("#run-checks-button"),
	newNodeButton: document.querySelector("#new-node-button"),
	newGroupButton: document.querySelector("#new-group-button"),
	sessionBadge: document.querySelector("#session-badge"),
	nodesTable: document.querySelector("#nodes-table"),
	nodeTableWrap: document.querySelector("#node-editor-grid .table-wrap"),
	groupsList: document.querySelector("#groups-list"),
	checksTable: document.querySelector("#checks-table"),
	toast: document.querySelector("#toast"),
	systemStatusList: document.querySelector("#system-status-list"),
	statNodes: document.querySelector("#stat-nodes"),
	statGroups: document.querySelector("#stat-groups"),
	statActiveNodes: document.querySelector("#stat-active-nodes"),
	statStorage: document.querySelector("#stat-storage"),
	statLastCheck: document.querySelector("#stat-last-check"),
	nodeSearchInput: document.querySelector("#node-search-input"),
	groupSearchInput: document.querySelector("#group-search-input"),
	nodeEditorGrid: document.querySelector("#node-editor-grid"),
	nodeEditorSide: document.querySelector("#node-editor-side"),
	nodeFormShell: document.querySelector("#node-form-shell"),
	nodeForm: document.querySelector("#node-form"),
	nodeFormTitle: document.querySelector("#node-form-title"),
	nodeFormHelp: document.querySelector("#node-form-help"),
	nodeId: document.querySelector("#node-id"),
	nodeImportText: document.querySelector("#node-import-text"),
	nodeImportPasteButton: document.querySelector("#node-import-paste-button"),
	nodeImportParseButton: document.querySelector("#node-import-parse-button"),
	nodeImportSelectWrap: document.querySelector("#node-import-select-wrap"),
	nodeImportSelect: document.querySelector("#node-import-select"),
	nodeImportApplyButton: document.querySelector("#node-import-apply-button"),
	nodeManualToggleButton: document.querySelector("#node-manual-toggle-button"),
	nodeDetailFields: document.querySelector("#node-detail-fields"),
	nodeName: document.querySelector("#node-name"),
	nodeProtocol: document.querySelector("#node-protocol"),
	nodeServer: document.querySelector("#node-server"),
	nodePort: document.querySelector("#node-port"),
	nodeTransport: document.querySelector("#node-transport"),
	nodeTrafficMode: document.querySelector("#node-traffic-mode"),
	nodeUuid: document.querySelector("#node-uuid"),
	nodePassword: document.querySelector("#node-password"),
	nodePublicKey: document.querySelector("#node-public-key"),
	nodeShortId: document.querySelector("#node-short-id"),
	nodeSni: document.querySelector("#node-sni"),
	nodeFlow: document.querySelector("#node-flow"),
	nodeTrafficQuotaGb: document.querySelector("#node-traffic-quota-gb"),
	nodeTrafficUsedGb: document.querySelector("#node-traffic-used-gb"),
	nodeTrafficResetDay: document.querySelector("#node-traffic-reset-day"),
	nodeNote: document.querySelector("#node-note"),
	resetNodeButton: document.querySelector("#reset-node-button"),
	groupEditorGrid: document.querySelector("#group-editor-grid"),
	groupEditorSide: document.querySelector("#group-editor-side"),
	groupFormShell: document.querySelector("#group-form-shell"),
	groupForm: document.querySelector("#group-form"),
	groupFormTitle: document.querySelector("#group-form-title"),
	groupId: document.querySelector("#group-id"),
	groupName: document.querySelector("#group-name"),
	groupSlug: document.querySelector("#group-slug"),
	groupToken: document.querySelector("#group-token"),
	groupTokenGenerateButton: document.querySelector("#group-token-generate-button"),
	groupMembersEditor: document.querySelector("#group-members-editor"),
	resetGroupButton: document.querySelector("#reset-group-button"),
	themeModal: document.querySelector("#theme-modal"),
	qrModal: document.querySelector("#qr-modal"),
	qrTitle: document.querySelector("#qr-modal-title"),
	qrImage: document.querySelector("#qr-modal-image"),
	qrHint: document.querySelector("#qr-modal-hint"),
	qrCloseButton: document.querySelector("#qr-close-button"),
	themeCloseButton: document.querySelector("#theme-close-button"),
	themeCancelButton: document.querySelector("#theme-cancel-button"),
	themeSaveButton: document.querySelector("#theme-save-button"),
	themeResetButton: document.querySelector("#theme-reset-button"),
	themeModeOptions: document.querySelector("#theme-mode-options"),
	themeFamilyOptions: document.querySelector("#theme-family-options"),
	themePaletteOptions: document.querySelector("#theme-palette-options"),
	themeModalSummary: document.querySelector("#theme-modal-summary"),
	themeFamilyDescription: document.querySelector("#theme-family-description"),
	brandInput: document.querySelector("#brand-input"),
	};

function applyPanelBrand(brand = state.brand) {
	state.brand = String(brand || "").trim() || PANEL_CONFIG.brand;
	document.title = state.brand;
	document.querySelectorAll("[data-panel-brand]").forEach((element) => {
		element.textContent = state.brand;
	});
}

function buildQrAssetUrl(text, label) {
	return `/api/qr?text=${encodeURIComponent(text)}&label=${encodeURIComponent(label)}`;
}

function openQrModal(title, url, hint) {
	els.qrTitle.textContent = title;
	els.qrImage.src = buildQrAssetUrl(url, title);
	els.qrImage.alt = `${title} 二维码`;
	els.qrHint.textContent = hint;
	els.qrModal.hidden = false;
}

function closeQrModal() {
	els.qrModal.hidden = true;
	els.qrImage.removeAttribute("src");
}

function getThemePreset(family, palette) {
	const familyConfig = THEME_OPTIONS[family] || THEME_OPTIONS[DEFAULT_THEME.family];
	return familyConfig.presets.find((item) => item.id === palette) || familyConfig.presets[0];
}

function resolveThemeMode(mode) {
	if (mode === "system") {
		return window.matchMedia?.("(prefers-color-scheme: light)")?.matches ? "light" : "dark";
	}
	return mode === "light" ? "light" : "dark";
}

function normalizeTheme(theme) {
	const mode = theme?.mode === "system" ? "system" : theme?.mode === "light" ? "light" : "dark";
	const family = ["mono", "neon", "macaron"].includes(theme?.family) ? theme.family : DEFAULT_THEME.family;
	const preset = getThemePreset(family, theme?.palette);
	return {
		mode,
		family,
		palette: preset.id,
	};
}

function readSavedTheme() {
	try {
		const raw = localStorage.getItem(THEME_STORAGE_KEY);
		return normalizeTheme(raw ? JSON.parse(raw) : DEFAULT_THEME);
	} catch {
		return { ...DEFAULT_THEME };
	}
}

function saveTheme(theme) {
	localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(theme));
}

function applyTheme(theme, { commit = false } = {}) {
	const normalized = normalizeTheme(theme);
	if (commit) {
		state.theme = normalized;
	}
	document.documentElement.dataset.themeMode = resolveThemeMode(normalized.mode);
	document.documentElement.dataset.themeModePreference = normalized.mode;
	document.documentElement.dataset.themeFamily = normalized.family;
	document.documentElement.dataset.themePalette = normalized.palette;
}

function renderThemeOptions() {
	els.themeModeOptions.innerHTML = THEME_MODES.map(
		(option) => `
			<button class="choice-card ${state.themeDraft.mode === option.id ? "is-selected" : ""}" type="button" data-theme-mode="${option.id}">
				<strong>${escapeHtml(option.label)}</strong>
				<span>${escapeHtml(option.note)}</span>
			</button>
		`,
	).join("");

	els.themeFamilyOptions.innerHTML = Object.entries(THEME_OPTIONS).map(
		([family, config]) => `
			<button class="choice-card ${state.themeDraft.family === family ? "is-selected" : ""}" type="button" data-theme-family="${family}">
				<strong>${escapeHtml(config.label)}</strong>
				<span>${escapeHtml(config.description)}</span>
			</button>
		`,
	).join("");

	const currentFamily = THEME_OPTIONS[state.themeDraft.family];
	els.themeModalSummary.textContent =
		state.themeDraft.family === "mono"
			? "黑白风格提供一套黑白灰单配色，作为默认主题方案。"
			: state.themeDraft.family === "neon"
				? "当前默认风格属于冷光霓虹，另外还准备了 5 个同风格可选方案。"
				: "马卡龙风格提供红橙黄绿青蓝紫粉 8 种柔和单配色。";
	els.themeFamilyDescription.textContent = currentFamily.description;

	els.themePaletteOptions.innerHTML = currentFamily.presets.map(
		(preset) => `
			<button class="palette-card ${state.themeDraft.palette === preset.id ? "is-selected" : ""}" type="button" data-theme-palette="${preset.id}">
				<div class="palette-swatches">
					${preset.swatches
						.map(
							(swatch) =>
								`<span class="palette-swatch" style="background:hsl(${escapeHtml(swatch)})"></span>`,
						)
						.join("")}
				</div>
				<div>
					<h3>${escapeHtml(preset.name)}</h3>
					<p>${escapeHtml(preset.note)}</p>
				</div>
			</button>
		`,
	).join("");
}

function openThemeModal() {
	state.themeDraft = { ...state.theme };
	els.brandInput.value = state.brand;
	renderThemeOptions();
	els.themeModal.hidden = false;
}

function closeThemeModal({ revert = true } = {}) {
	if (revert) {
		applyTheme(state.theme);
	}
	els.themeModal.hidden = true;
}

function setNodeEditorOpen(open) {
	state.nodeEditorOpen = Boolean(open);
	els.nodeEditorSide.classList.toggle("is-open", state.nodeEditorOpen);
	els.nodeFormShell.classList.toggle("is-open", state.nodeEditorOpen);
	els.nodeForm.classList.toggle("is-open", state.nodeEditorOpen);
	els.nodeEditorGrid.classList.toggle("is-collapsed", !state.nodeEditorOpen);
	els.newNodeButton.textContent = state.nodeEditorOpen ? "收起节点" : "新建节点";
	scheduleScrollWindowSync();
}

function setNodeDetailOpen(open) {
	els.nodeDetailFields.hidden = !open;
	els.nodeManualToggleButton.textContent = open ? "隐藏表单" : "手动填写";
}

function setGroupEditorOpen(open) {
	state.groupEditorOpen = Boolean(open);
	els.groupEditorSide.classList.toggle("is-open", state.groupEditorOpen);
	els.groupFormShell.classList.toggle("is-open", state.groupEditorOpen);
	els.groupForm.classList.toggle("is-open", state.groupEditorOpen);
	els.groupEditorGrid.classList.toggle("is-collapsed", !state.groupEditorOpen);
	els.newGroupButton.textContent = state.groupEditorOpen ? "收起分组" : "新建分组";
	scheduleScrollWindowSync();
}

function generateSubscriptionToken() {
	return crypto.randomUUID().replaceAll("-", "");
}

function showToast(message, type = "success") {
	els.toast.textContent = message;
	els.toast.className = `toast ${type}`;
	els.toast.hidden = false;
	clearTimeout(showToast.timer);
	showToast.timer = setTimeout(() => {
		els.toast.hidden = true;
	}, 2800);
}

async function api(path, init = {}) {
	const headers = {
		...(init.headers || {}),
	};

	if (init.body && !headers["content-type"]) {
		headers["content-type"] = "application/json";
	}

	const response = await fetch(path, { ...init, headers });
	if (!response.ok) {
		let message = `请求失败: ${response.status}`;
		try {
			const payload = await response.json();
			if (payload.detail) message = payload.detail;
			else if (payload.error) message = payload.error;
		} catch {}
		throw new Error(message);
	}

	const contentType = response.headers.get("content-type") || "";
	return contentType.includes("application/json") ? response.json() : response.text();
}

function setAuthenticated(value, storageMode = "mock") {
	state.authenticated = value;
	document.body.classList.toggle("login-only", !value);
	els.loginPanel.hidden = value;
	els.appPanel.hidden = !value;
	els.logoutButton.hidden = !value;
	els.sessionBadge.textContent = value ? `已登录 · ${storageMode}` : "未登录";
}

function updateStats(summary) {
	state.summary = summary;
	els.statNodes.textContent = String(summary.nodeCount ?? 0);
	els.statGroups.textContent = String(summary.groupCount ?? 0);
	els.statActiveNodes.textContent = String(summary.activeNodeCount ?? 0);
	els.statStorage.textContent = summary.storageMode ?? "mock";
	els.statLastCheck.textContent = summary.lastCheckAt ? formatTime(summary.lastCheckAt) : "尚未检测";
	els.sessionBadge.textContent = `已登录 · ${summary.storageMode ?? "mock"}`;
	renderSystemStatus();
}

function renderSystemStatus() {
	const lastCheck = state.summary.lastCheckAt ? formatTime(state.summary.lastCheckAt) : "尚未检测";
	const lastResult = state.checks.length
		? state.checks[0].tcpOk
			? "最近一次检测包含可达节点"
			: "最近一次检测全部失败"
		: "还没有线路检查结果";
	const rows = [
		{
			key: "存储后端",
			value: state.summary.storageMode === "d1" ? "D1 持久化" : "Mock 内存模式",
			note: state.summary.storageMode === "d1" ? "线上推荐状态" : "刷新或重启后会丢失编辑",
		},
		{
			key: "鉴权配置",
			value: state.authConfigured ? "已配置" : "未配置",
			note: state.usingDevAuthFallback ? "当前使用本地开发回退密钥" : "远程环境应仅使用真实 secrets",
		},
		{
			key: "最近检测",
			value: lastCheck,
			note: lastResult,
		},
		{
			key: "流量边界",
			value: "面板走 Cloudflare",
			note: "真实代理流量应直接连接你的 VPS 或中转入口",
		},
	];

	els.systemStatusList.innerHTML = rows
		.map(
			(row) => `
				<div class="status-row">
					<div>
						<div class="status-key">${escapeHtml(row.key)}</div>
						<div class="status-note">${escapeHtml(row.note)}</div>
					</div>
					<div class="status-value">${escapeHtml(row.value)}</div>
				</div>
			`,
		)
		.join("");
}

function normalizeKeyword(value) {
	return String(value || "").trim().toLowerCase();
}

function uniqueSlug(baseSlug) {
	const normalized = normalizeSlug(baseSlug);
	const existing = new Set(state.groups.map((group) => group.slug));
	if (!existing.has(normalized)) return normalized;
	let index = 2;
	while (existing.has(`${normalized}-${index}`)) {
		index += 1;
	}
	return `${normalized}-${index}`;
}

function uniqueToken(label) {
	const base = normalizeSlug(label);
	const existing = new Set(state.groups.map((group) => group.subscriptionToken));
	if (!existing.has(base)) return base;
	return `${base}-${crypto.randomUUID().slice(0, 8)}`;
}

function buildNodeClone(node) {
	return {
		...node,
		id: "",
		name: `${node.name} 副本`,
		note: node.note ? `${node.note} | cloned` : "cloned",
	};
}

function buildGroupClone(group) {
	const suffix = `${group.slug}-copy`;
	return {
		id: "",
		name: `${group.name} 副本`,
		slug: uniqueSlug(suffix),
		subscriptionToken: uniqueToken(suffix),
		enabled: Boolean(group.enabled),
		showTrafficInName: Boolean(group.showTrafficInName),
		members: group.members.map((member) => ({
			nodeId: member.nodeId,
			displayName: member.displayName || "",
			sortOrder: member.sortOrder,
		})),
	};
}

function parseShareLinkLine(line, index) {
	if (!line) return null;
	if (line.startsWith("vmess://")) {
		throw new Error("当前导入仅支持 vless:// 和 trojan://，暂不支持 vmess://");
	}

	const url = new URL(line);
	const rawProtocol = url.protocol.replace(":", "");
	if (!["vless", "trojan"].includes(rawProtocol)) {
		throw new Error(`暂不支持 ${rawProtocol} 链接导入`);
	}

	const tag = decodeURIComponent((url.hash || "").replace(/^#/, "")) || `${rawProtocol}-${index + 1}`;
	const common = {
		id: "",
		name: tag,
		server: url.hostname,
		port: Number(url.port || 443),
		transport: url.searchParams.get("type") || "tcp",
		enabled: true,
		sni: url.searchParams.get("sni") || url.searchParams.get("peer") || url.searchParams.get("host") || "",
		note: `Imported from ${rawProtocol} share link`,
	};

	if (rawProtocol === "trojan") {
		return {
			label: `${tag} | trojan`,
			value: {
				...common,
				protocol: "trojan",
				password: decodeURIComponent(url.username || ""),
				uuid: "",
				publicKey: "",
				shortId: "",
				flow: "",
			},
		};
	}

	const publicKey = url.searchParams.get("pbk") || url.searchParams.get("publicKey") || "";
	const shortId = url.searchParams.get("sid") || url.searchParams.get("shortId") || "";
	const security = url.searchParams.get("security") || "";
	const protocol = security === "reality" || publicKey ? "vless-reality" : "vless";
	return {
		label: `${tag} | ${protocol}`,
		value: {
			...common,
			protocol,
			uuid: decodeURIComponent(url.username || ""),
			password: "",
			publicKey,
			shortId,
			flow: url.searchParams.get("flow") || (protocol === "vless-reality" ? "xtls-rprx-vision" : ""),
		},
	};
}

function normalizeImportedNode(raw, source = "config") {
	const server = raw.server || raw.address || raw.add || raw.host || raw.hostname || "";
	const port = Number(raw.port || raw.server_port || raw.remotePort || 443);
	const protocolRaw = String(raw.protocol || raw.type || raw.scheme || "").toLowerCase();
	const security = String(raw.security || raw.tls || raw.streamSecurity || "").toLowerCase();
	const publicKey = raw.publicKey || raw["public-key"] || raw.pbk || raw.realityPublicKey || "";
	const shortId = raw.shortId || raw["short-id"] || raw.sid || raw.realityShortId || "";
	const flow = raw.flow || raw.xtlsFlow || "";
	let protocol = protocolRaw;
	if (protocolRaw === "vless" && (security === "reality" || publicKey)) {
		protocol = "vless-reality";
	}
	if (!["vless", "vless-reality", "trojan"].includes(protocol)) {
		throw new Error(`暂不支持 ${protocolRaw || "未知"} 配置导入`);
	}
	return {
		id: "",
		name: raw.name || raw.ps || raw.remarks || raw.tag || `${protocol}-${server || "node"}`,
		protocol,
		server,
		port: Number.isFinite(port) ? port : 443,
		transport: raw.transport || raw.network || raw.type || "tcp",
		enabled: raw.enabled !== false,
		uuid: raw.uuid || raw.id || raw.userId || "",
		password: raw.password || raw.pass || "",
		publicKey,
		shortId,
		sni: raw.sni || raw.serverName || raw.host || raw.peer || "",
		flow: flow || (protocol === "vless-reality" ? "xtls-rprx-vision" : ""),
		note: raw.note || raw.description || `Imported from ${source}`,
	};
}

function parseJsonImport(input) {
	const raw = JSON.parse(input);
	const list = Array.isArray(raw)
		? raw
		: Array.isArray(raw?.proxies)
			? raw.proxies
			: Array.isArray(raw?.outbounds)
				? raw.outbounds
				: [raw];
	return list
		.map((item, index) => {
			if (item?.protocol && item?.settings?.vnext?.[0]) {
				const serverItem = item.settings.vnext[0];
				const user = serverItem.users?.[0] || {};
				return {
					label: `${item.tag || item.remarks || `json-${index + 1}`} | ${item.protocol}`,
					value: normalizeImportedNode(
						{
							name: item.tag || item.remarks,
							protocol: item.protocol,
							server: serverItem.address,
							port: serverItem.port,
							uuid: user.id,
							flow: user.flow,
							security: item.streamSettings?.security,
							publicKey: item.streamSettings?.realitySettings?.publicKey,
							shortId: item.streamSettings?.realitySettings?.shortId,
							sni: item.streamSettings?.realitySettings?.serverName || item.streamSettings?.tlsSettings?.serverName,
							transport: item.streamSettings?.network,
						},
						"json config",
					),
				};
			}
			if (item?.protocol === "trojan" && item?.settings?.servers?.[0]) {
				const serverItem = item.settings.servers[0];
				return {
					label: `${item.tag || item.remarks || `json-${index + 1}`} | trojan`,
					value: normalizeImportedNode(
						{
							name: item.tag || item.remarks,
							protocol: "trojan",
							server: serverItem.address,
							port: serverItem.port,
							password: serverItem.password,
							sni: item.streamSettings?.tlsSettings?.serverName || serverItem.sni,
							transport: item.streamSettings?.network,
						},
						"json config",
					),
				};
			}
			return {
				label: `${item.name || item.tag || item.remarks || `json-${index + 1}`} | ${item.protocol || item.type || "config"}`,
				value: normalizeImportedNode(item, "json config"),
			};
		})
		.filter((item) => item?.value?.server);
}

function parseKeyValueImport(input) {
	const blocks = String(input || "")
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean);
	const aliases = {
		name: ["name", "remark", "remarks", "ps", "tag", "名称", "节点名称"],
		protocol: ["protocol", "type", "协议", "协议类型"],
		server: ["server", "address", "host", "hostname", "add", "入口地址", "地址", "服务器"],
		port: ["port", "server_port", "端口"],
		uuid: ["uuid", "id", "用户id"],
		password: ["password", "pass", "密码"],
		publicKey: ["public key", "publickey", "pbk", "reality public key", "公钥", "public_key"],
		shortId: ["short id", "shortid", "sid", "short_id", "短id"],
		sni: ["sni", "server name", "servername", "host header", "域名", "伪装域名"],
		flow: ["flow", "流控"],
		transport: ["transport", "network", "type transport", "传输", "传输层"],
		security: ["security", "tls", "streamsecurity", "加密"],
		note: ["note", "description", "备注", "说明"],
	};
	const normalizedAliases = Object.fromEntries(
		Object.entries(aliases).map(([key, values]) => [
			key,
			values.map((value) => normalizeKeyword(value).replace(/\s+/g, "")),
		]),
	);

	return blocks
		.map((block, index) => {
			const raw = {};
			for (const line of block.split(/\r?\n/)) {
				const match = line.match(/^([^:=：]+)\s*[:=：]\s*(.+)$/);
				if (!match) continue;
				const key = normalizeKeyword(match[1]).replace(/\s+/g, "");
				const value = match[2].trim();
				for (const [target, keys] of Object.entries(normalizedAliases)) {
					if (keys.includes(key)) {
						raw[target] = value;
					}
				}
			}
			if (!raw.server || !raw.protocol) return null;
			const value = normalizeImportedNode(raw, "key-value config");
			return {
				label: `${value.name || `config-${index + 1}`} | ${value.protocol}`,
				value,
			};
		})
		.filter(Boolean);
}

function parseImportInput(input) {
	const text = String(input || "").trim();
	if (!text) return [];

	const lines = text
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter(Boolean);
	const shareLike = lines.every((line) => /^[a-z]+:\/\//i.test(line));
	if (shareLike) {
		const seen = new Set();
		return lines.flatMap((line, index) => {
			if (seen.has(line)) return [];
			seen.add(line);
			return [parseShareLinkLine(line, index)];
		});
	}

	if (text.startsWith("{") || text.startsWith("[")) {
		const jsonItems = parseJsonImport(text);
		if (jsonItems.length) return jsonItems;
	}

	const kvItems = parseKeyValueImport(text);
	if (kvItems.length) return kvItems;

	throw new Error("没有识别到可导入的链接或配置信息");
}

function normalizeSlug(value) {
	return String(value || "")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "") || "new-group";
}

function getNodeSearchKeyword() {
	return normalizeKeyword(els.nodeSearchInput.value);
}

function getGroupSearchKeyword() {
	return normalizeKeyword(els.groupSearchInput.value);
}

function getFilteredNodes() {
	const keyword = getNodeSearchKeyword();
	if (!keyword) return state.nodes;
	return state.nodes.filter((node) => {
		const haystack = normalizeKeyword(
			[node.name, node.server, node.protocol, node.note, node.sni, node.id].join(" "),
		);
		return haystack.includes(keyword);
	});
}

function getFilteredGroups() {
	const keyword = getGroupSearchKeyword();
	if (!keyword) return state.groups;
	return state.groups.filter((group) => {
		const members = group.members
			.map((member) => member.displayName || member.node?.name || member.nodeId)
			.join(" ");
		const haystack = normalizeKeyword(
			[group.name, group.slug, group.subscriptionToken, members].join(" "),
		);
		return haystack.includes(keyword);
	});
}

function formatTrafficSummary(node) {
	if (!node) return "流量未知";
	if (node.trafficMode === "unlimited") {
		return "不限流";
	}
	const isShared = node.trafficMode === "shared-report";
	const prefix = isShared ? "共享流量 · " : "";
	const quota = node.trafficQuotaGb;
	const used = node.trafficUsedGb;
	if (quota != null && used != null) {
		return `${prefix}余 ${(Math.max(0, quota - used)).toFixed(1)}GB / 共 ${quota.toFixed(1)}GB`;
	}
	if (used != null) {
		return `${prefix}已用 ${used.toFixed(1)}GB`;
	}
	if (quota != null) {
		return `${prefix}总量 ${quota.toFixed(1)}GB`;
	}
	return isShared ? "共享流量" : "流量未知";
}

function renderNodes() {
	const nodes = getFilteredNodes();
	if (!nodes.length) {
		els.nodesTable.innerHTML = `
			<tr>
				<td colspan="5" class="muted">${
					state.nodes.length ? "没有匹配当前筛选条件的节点。" : "还没有节点，点击右上角“新建节点”开始添加。"
				}</td>
			</tr>
		`;
		scheduleScrollWindowSync();
		return;
	}

	els.nodesTable.innerHTML = nodes
		.map(
			(node) => `
				<tr>
					<td>
						<div><strong>${escapeHtml(node.name)}</strong></div>
						<div class="mono">${escapeHtml(node.id)}</div>
						<div class="member-list">${escapeHtml(formatTrafficSummary(node))}</div>
					</td>
					<td>
						<div class="endpoint">
							<span>${escapeHtml(node.server)}:${node.port}</span>
							<span class="mono">${escapeHtml(node.sni || "-")}</span>
						</div>
					</td>
					<td>${escapeHtml(node.protocol)}</td>
					<td class="node-status-cell">
						<label class="switch-pill node-switch-pill ${node.enabled ? "is-enabled" : "is-disabled"}">
							<input
								class="group-enabled-toggle"
								type="checkbox"
								data-action="toggle-node-enabled"
								data-id="${escapeHtml(node.id)}"
								${node.enabled ? "checked" : ""}
							/>
							<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
							<span class="switch-label">${node.enabled ? "已启用" : "未启用"}</span>
						</label>
					</td>
					<td class="action-cell">
						<div class="action-buttons">
							<button class="mini-button" type="button" data-action="clone-node" data-id="${escapeHtml(node.id)}">克隆</button>
							<button class="mini-button" type="button" data-action="edit-node" data-id="${escapeHtml(node.id)}">编辑</button>
							<button class="mini-button danger" type="button" data-action="delete-node" data-id="${escapeHtml(node.id)}">删除</button>
						</div>
					</td>
				</tr>`,
		)
		.join("");
	scheduleScrollWindowSync();
}

function getSubscriptionTitle(group) {
	const brand = String(state.brand || "").trim();
	return brand && brand !== PANEL_CONFIG.brand
		? brand
		: group.name || group.slug || "subscription";
}

function buildNamedSubscriptionUrl(origin, kind, token, title, extension) {
	return `${origin}/subscribe/${kind}/${encodeURIComponent(token)}/${encodeURIComponent(`${title}.${extension}`)}`;
}

function renderGroups() {
	const origin = window.location.origin;
	const groups = getFilteredGroups();
	if (!groups.length) {
		els.groupsList.innerHTML = `
			<article class="group-card">
				<div class="member-list">${
					state.groups.length ? "没有匹配当前筛选条件的分组。" : "还没有分组，点击右上角“新建分组”开始添加。"
				}</div>
			</article>
		`;
		scheduleScrollWindowSync();
		return;
	}

	els.groupsList.innerHTML = groups
		.map((group) => {
			const members = group.members
				.map((member) => member.displayName || member.node?.name || member.nodeId)
				.join(" / ");
			const subscriptionTitle = getSubscriptionTitle(group);
			const v2raynUrl = buildNamedSubscriptionUrl(
				origin,
				"v2rayn",
				group.subscriptionToken,
				subscriptionTitle,
				"txt",
			);
			const v2raynNamedUrl = `${v2raynUrl}#remarks=${encodeURIComponent(group.name)}`;
			const clashUrl = buildNamedSubscriptionUrl(
				origin,
				"clash",
				group.subscriptionToken,
				subscriptionTitle,
				"yaml",
			);
			const toggleLabel = group.enabled ? "已启用" : "未启用";
			const trafficLabel = group.showTrafficInName ? "显示流量" : "隐藏流量";
			const subscriptionControls = group.enabled
				? `
					<div class="subscription-links">
						<a href="${escapeHtml(v2raynNamedUrl)}" target="_blank" rel="noreferrer">v2rayN 订阅</a>
						<button class="mini-button" type="button" data-action="copy-url" data-kind="v2rayN 链接" data-value="${escapeHtml(v2raynNamedUrl)}">复制链接</button>
						<button class="mini-button icon-button" type="button" data-action="show-qr" data-kind="v2rayN 二维码" data-label="${escapeHtml(`${group.name} · v2rayN`)}" data-hint="使用客户端扫码导入当前分组的 v2rayN 订阅链接。" data-value="${escapeHtml(v2raynNamedUrl)}" title="显示 v2rayN 二维码" aria-label="显示 v2rayN 二维码">▦</button>
						<a href="${clashUrl}" target="_blank" rel="noreferrer">Clash 订阅</a>
						<button class="mini-button" type="button" data-action="copy-url" data-kind="Clash 链接" data-value="${escapeHtml(clashUrl)}">复制链接</button>
						<button class="mini-button" type="button" data-action="download-subscription-file" data-kind="Clash YAML" data-value="${escapeHtml(clashUrl)}" data-filename="${escapeHtml(`${subscriptionTitle}.yaml`)}">下载 YAML</button>
						<button class="mini-button icon-button" type="button" data-action="show-qr" data-kind="Clash 二维码" data-label="${escapeHtml(`${group.name} · Clash`)}" data-hint="使用客户端扫码导入当前分组的 Clash 订阅链接。" data-value="${escapeHtml(clashUrl)}" title="显示 Clash 二维码" aria-label="显示 Clash 二维码">▦</button>
					</div>
					<div class="inline-note subscription-note">Clash Mi 的 URL 导入名不可控；需要自定义显示名时下载 YAML 后从文件导入。</div>
				`
				: `
					<div class="subscription-links is-disabled">
						<span class="subscription-link-disabled">v2rayN 订阅</span>
						<button class="mini-button" type="button" disabled>复制链接</button>
						<button class="mini-button icon-button" type="button" disabled>▦</button>
						<span class="subscription-link-disabled">Clash 订阅</span>
						<button class="mini-button" type="button" disabled>复制链接</button>
						<button class="mini-button" type="button" disabled>下载 YAML</button>
						<button class="mini-button icon-button" type="button" disabled>▦</button>
					</div>
					<div class="inline-note subscription-note">当前分组未启用，订阅链接会返回 404。启用分组后再导入客户端。</div>
				`;
			return `
				<article class="group-card">
					<div class="group-card-header">
						<div>
							<h3>${escapeHtml(group.name)}</h3>
							<div class="mono">${escapeHtml(group.slug)}</div>
						</div>
						<label class="switch-pill ${group.enabled ? "is-enabled" : "is-disabled"}">
							<input
								class="group-enabled-toggle"
								type="checkbox"
								data-action="toggle-group-enabled"
								data-id="${escapeHtml(group.id)}"
								${group.enabled ? "checked" : ""}
							/>
							<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
							<span class="switch-label">${toggleLabel}</span>
						</label>
					</div>
					<div class="member-list">成员: ${escapeHtml(members || "暂无成员")}</div>
					<div class="member-list">Token: <span class="mono">${escapeHtml(group.subscriptionToken)}</span></div>
					<div class="copy-row">
						<label class="switch-pill ${group.showTrafficInName ? "is-enabled" : "is-disabled"}">
							<input
								class="group-enabled-toggle"
								type="checkbox"
								data-action="toggle-group-traffic-name"
								data-id="${escapeHtml(group.id)}"
								${group.showTrafficInName ? "checked" : ""}
							/>
							<span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
							<span class="switch-label">${trafficLabel}</span>
						</label>
					</div>
					${subscriptionControls}
					<div class="copy-row">
						<button class="mini-button" type="button" data-action="copy-token" data-kind="Token" data-value="${escapeHtml(group.subscriptionToken)}">复制 Token</button>
					</div>
					<div class="action-buttons">
						<button class="mini-button" type="button" data-action="clone-group" data-id="${escapeHtml(group.id)}">克隆</button>
						<button class="mini-button" type="button" data-action="edit-group" data-id="${escapeHtml(group.id)}">编辑</button>
						<button class="mini-button danger" type="button" data-action="delete-group" data-id="${escapeHtml(group.id)}">删除</button>
					</div>
				</article>
			`;
		})
		.join("");
	scheduleScrollWindowSync();
}

function renderChecks() {
	if (!state.checks.length) {
		els.checksTable.innerHTML = `
			<tr>
				<td colspan="5" class="muted">还没有检测记录，点击“运行检测”生成。</td>
			</tr>
		`;
		return;
	}

	els.checksTable.innerHTML = state.checks
		.map(
			(check) => `
				<tr>
					<td>${escapeHtml(check.node?.name || check.nodeId)}</td>
					<td class="${check.tcpOk ? "status-ok" : "status-off"}">${check.tcpOk ? "可达" : "失败"}</td>
					<td>${check.latencyMs == null ? "-" : `${check.latencyMs} ms`}</td>
					<td>${escapeHtml(check.lastError || "-")}</td>
					<td>${formatTime(check.checkedAt)}</td>
				</tr>`,
		)
		.join("");
}

function renderGroupMembersEditor(selectedGroup = null) {
	const selectedMembers = new Map((selectedGroup?.members || []).map((member) => [member.nodeId, member]));
	if (!state.nodes.length) {
		els.groupMembersEditor.innerHTML = `
			<div class="member-item">
				<div class="inline-note">还没有节点，先创建节点后再给分组添加成员。</div>
			</div>
		`;
		scheduleScrollWindowSync();
		return;
	}

	const selectedNodes = state.nodes
		.filter((node) => selectedMembers.has(node.id))
		.sort(
			(a, b) =>
				(selectedMembers.get(a.id)?.sortOrder ?? 0) - (selectedMembers.get(b.id)?.sortOrder ?? 0),
		);
	const unselectedNodes = state.nodes
		.filter((node) => !selectedMembers.has(node.id))
		.sort((a, b) => a.name.localeCompare(b.name));
	const orderedNodes = [...selectedNodes, ...unselectedNodes];

	els.groupMembersEditor.innerHTML = orderedNodes
		.map((node, index) => {
			const member = selectedMembers.get(node.id);
			const checked = Boolean(member);
			return `
				<label
					class="member-item ${checked ? "is-selected is-draggable" : "disabled"}"
					data-node-id="${escapeHtml(node.id)}"
					data-protocol="${escapeHtml(node.protocol)}"
					data-selected="${checked ? "1" : "0"}"
					draggable="${checked ? "true" : "false"}"
				>
					<div class="member-item-header">
						<span>
							<input class="member-toggle" type="checkbox" data-node-id="${escapeHtml(node.id)}" ${checked ? "checked" : ""} />
							<strong>${escapeHtml(node.name)}</strong>
						</span>
						<span class="drag-note">${checked ? "拖拽排序" : escapeHtml(node.protocol)}</span>
					</div>
					<div class="member-item-body">
						<div class="form-grid two">
							<label class="field">
								<span>显示名称</span>
								<input
									class="member-display-name"
									data-node-id="${escapeHtml(node.id)}"
									value="${escapeHtml(member?.displayName || "")}"
									placeholder="留空则自动使用分组名-节点名"
									${checked ? "" : "disabled"}
								/>
							</label>
							<label class="field">
								<span>排序值</span>
								<input
									class="member-sort-order"
									data-node-id="${escapeHtml(node.id)}"
									type="number"
									value="${member?.sortOrder ?? (index + 1) * 10}"
									${checked ? "readonly" : "disabled"}
								/>
							</label>
						</div>
						<div class="inline-note">${escapeHtml(node.server)}:${node.port}</div>
					</div>
				</label>
			`;
		})
		.join("");
	syncSelectedMemberOrder();
	scheduleScrollWindowSync();
}

function syncSelectedMemberOrder() {
	const selectedItems = [...els.groupMembersEditor.querySelectorAll(".member-item[data-selected='1']")];
	selectedItems.forEach((item, index) => {
		const sortInput = item.querySelector(".member-sort-order");
		if (sortInput) sortInput.value = String((index + 1) * 10);
	});
}

function setScrollWindowHeight(container, items, visibleCount, extraHeight = 0) {
	if (!container) return;
	container.style.maxHeight = "";
	const visibleItems = items.filter(Boolean).slice(0, visibleCount);
	if (!visibleItems.length || items.length <= visibleCount) {
		container.style.maxHeight = "";
		return;
	}
	const styles = window.getComputedStyle(container);
	const gap = Number.parseFloat(styles.rowGap || styles.gap || "0") || 0;
	const itemsHeight = visibleItems.reduce((total, item) => total + item.getBoundingClientRect().height, 0);
	const totalGap = gap * Math.max(0, visibleItems.length - 1);
	container.style.maxHeight = `${Math.ceil(itemsHeight + totalGap + extraHeight)}px`;
}

function syncNodeTableWindow() {
	const rows = [...els.nodesTable.querySelectorAll("tr")];
	if (!els.nodeTableWrap) return;
	if (state.nodeEditorOpen) {
		const editorHeight = Math.ceil(els.nodeEditorSide?.getBoundingClientRect().height ?? 0);
		els.nodeTableWrap.style.maxHeight = editorHeight > 0 ? `${editorHeight}px` : "";
		return;
	}
	const headerHeight = els.nodeTableWrap.querySelector("thead")?.getBoundingClientRect().height ?? 0;
	setScrollWindowHeight(els.nodeTableWrap, rows, 6, headerHeight);
}

function syncGroupCardWindow() {
	if (state.groupEditorOpen) {
		const editorHeight = Math.ceil(els.groupEditorSide?.getBoundingClientRect().height ?? 0);
		els.groupsList.style.maxHeight = editorHeight > 0 ? `${editorHeight}px` : "";
		return;
	}
	const cards = [...els.groupsList.querySelectorAll(".group-card")];
	setScrollWindowHeight(els.groupsList, cards, 5);
}

function syncMemberEditorWindow() {
	const items = [...els.groupMembersEditor.querySelectorAll(".member-item")];
	setScrollWindowHeight(els.groupMembersEditor, items, 6);
}

let scrollWindowSyncFrame = 0;

function scheduleScrollWindowSync() {
	if (scrollWindowSyncFrame) {
		cancelAnimationFrame(scrollWindowSyncFrame);
	}
	scrollWindowSyncFrame = requestAnimationFrame(() => {
		scrollWindowSyncFrame = requestAnimationFrame(() => {
			syncNodeTableWindow();
			syncGroupCardWindow();
			if (state.groupEditorOpen) {
				syncMemberEditorWindow();
			}
			scrollWindowSyncFrame = 0;
		});
	});
}

function insertMemberItemBySelectionOrder(wrapper, checked) {
	if (!wrapper) return;
	if (!checked) {
		els.groupMembersEditor.append(wrapper);
		return;
	}
	const selectedItems = [...els.groupMembersEditor.querySelectorAll(".member-item[data-selected='1']")].filter(
		(item) => item !== wrapper,
	);
	const lastSelected = selectedItems.at(-1);
	if (lastSelected) {
		lastSelected.after(wrapper);
		return;
	}
	const firstUnselected = els.groupMembersEditor.querySelector(".member-item[data-selected='0']");
	if (firstUnselected) {
		firstUnselected.before(wrapper);
		return;
	}
	els.groupMembersEditor.append(wrapper);
}

function renderImportCandidates() {
	if (!state.nodeImportCandidates.length) {
		els.nodeImportSelectWrap.hidden = true;
		els.nodeImportApplyButton.hidden = true;
		els.nodeImportSelect.innerHTML = "";
		return;
	}

	els.nodeImportSelect.innerHTML = state.nodeImportCandidates
		.map(
			(candidate, index) =>
				`<option value="${index}">${escapeHtml(candidate.label)}</option>`,
		)
		.join("");
	els.nodeImportSelectWrap.hidden = false;
	els.nodeImportApplyButton.hidden = false;
}

function clearImportCandidates() {
	state.nodeImportCandidates = [];
	renderImportCandidates();
}

function applyImportCandidate(index = 0) {
	const candidate = state.nodeImportCandidates[index];
	if (!candidate) {
		showToast("没有可导入的节点信息", "error");
		return;
	}
	fillNodeForm(candidate.value, "import");
	clearImportCandidates();
	setNodeDetailOpen(true);
	setNodeEditorOpen(true);
	els.nodeEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
	showToast(`已识别并填入 ${candidate.value.name}，确认后保存`);
}

function updateNodeProtocolHelp() {
	const protocol = els.nodeProtocol.value;
	const messages = {
		"vless-reality": "需要至少填写 UUID、Public Key、Short ID、SNI，适合 Reality 主入口。",
		vless: "需要至少填写 UUID 和 SNI，适合普通 TLS VLESS 节点。",
		trojan: "需要至少填写密码和 SNI，适合 Trojan 节点。",
	};
	els.nodeFormHelp.textContent = messages[protocol] || "按协议填写必要字段。";
}

function updateNodeTrafficFields() {
	const mode = els.nodeTrafficMode.value;
	const unlimited = mode === "unlimited";
	els.nodeTrafficQuotaGb.disabled = unlimited;
	els.nodeTrafficUsedGb.disabled = unlimited;
	els.nodeTrafficResetDay.disabled = unlimited;
	if (unlimited) {
		els.nodeTrafficQuotaGb.value = "";
		els.nodeTrafficUsedGb.value = "";
		els.nodeTrafficResetDay.value = "";
	}
}

function fillNodeForm(node, mode = node?.id ? "edit" : "create") {
	const titles = {
		create: "新建节点",
		edit: "编辑节点",
		clone: "克隆节点",
		import: "导入节点",
	};
	els.nodeFormTitle.textContent = titles[mode] || titles.create;
	els.nodeId.value = node?.id || "";
	els.nodeName.value = node?.name || "";
	els.nodeProtocol.value = node?.protocol || "vless-reality";
	els.nodeServer.value = node?.server || "";
	els.nodePort.value = String(node?.port ?? 443);
	els.nodeTransport.value = node?.transport || "tcp";
	els.nodeTrafficMode.value = node?.trafficMode || "manual";
	els.nodeUuid.value = node?.uuid || "";
	els.nodePassword.value = node?.password || "";
	els.nodePublicKey.value = node?.publicKey || "";
	els.nodeShortId.value = node?.shortId || "";
	els.nodeSni.value = node?.sni || "";
	els.nodeFlow.value = node?.flow || "xtls-rprx-vision";
	els.nodeTrafficQuotaGb.value =
		node?.trafficQuotaGb === null || node?.trafficQuotaGb === undefined ? "" : String(node.trafficQuotaGb);
	els.nodeTrafficUsedGb.value =
		node?.trafficUsedGb === null || node?.trafficUsedGb === undefined ? "" : String(node.trafficUsedGb);
	els.nodeTrafficResetDay.value =
		node?.trafficResetDay === null || node?.trafficResetDay === undefined ? "" : String(node.trafficResetDay);
	els.nodeNote.value = node?.note || "";
	if (mode === "create") {
		els.nodeImportText.value = "";
		clearImportCandidates();
	}
	setNodeDetailOpen(mode !== "create");
	updateNodeProtocolHelp();
	updateNodeTrafficFields();
}

function fillGroupForm(group, mode = group?.id ? "edit" : "create") {
	const titles = {
		create: "新建分组",
		edit: "编辑分组",
		clone: "克隆分组",
	};
	els.groupFormTitle.textContent = titles[mode] || titles.create;
	els.groupId.value = group?.id || "";
	els.groupName.value = group?.name || "";
	els.groupSlug.value = group?.slug || "";
	els.groupSlug.dataset.manual = group?.slug ? "1" : "";
	els.groupToken.value = group?.subscriptionToken || generateSubscriptionToken();
	els.groupForm.dataset.showTrafficInName = group?.showTrafficInName ? "1" : "0";
	renderGroupMembersEditor(group);
}

function resetNodeForm() {
	fillNodeForm(null);
}

function resetGroupForm() {
	fillGroupForm(null);
}

function getNodeFormPayload() {
	return {
		id: els.nodeId.value || undefined,
		name: els.nodeName.value.trim(),
		protocol: els.nodeProtocol.value,
		server: els.nodeServer.value.trim(),
		port: Number(els.nodePort.value || 443),
		transport: els.nodeTransport.value.trim() || "tcp",
		enabled: state.nodes.find((item) => item.id === els.nodeId.value)?.enabled ?? true,
		trafficMode: els.nodeTrafficMode.value,
		uuid: els.nodeUuid.value.trim(),
		password: els.nodePassword.value.trim(),
		publicKey: els.nodePublicKey.value.trim(),
		shortId: els.nodeShortId.value.trim(),
		sni: els.nodeSni.value.trim(),
		flow: els.nodeFlow.value.trim() || "xtls-rprx-vision",
		trafficQuotaGb: els.nodeTrafficQuotaGb.value === "" ? null : Number(els.nodeTrafficQuotaGb.value),
		trafficUsedGb: els.nodeTrafficUsedGb.value === "" ? null : Number(els.nodeTrafficUsedGb.value),
		trafficResetDay: els.nodeTrafficResetDay.value === "" ? null : Number(els.nodeTrafficResetDay.value),
		note: els.nodeNote.value.trim(),
	};
}

function validateNodePayload(payload) {
	const errors = [];
	if (!payload.name) errors.push("请填写节点名称");
	if (!payload.server) errors.push("请填写入口地址");
	if (!payload.port || Number.isNaN(payload.port)) errors.push("请填写有效端口");
	if (payload.protocol === "vless-reality") {
		if (!payload.uuid) errors.push("Reality 节点需要 UUID");
		if (!payload.publicKey) errors.push("Reality 节点需要 Public Key");
		if (!payload.shortId) errors.push("Reality 节点建议填写 Short ID");
		if (!payload.sni) errors.push("Reality 节点需要 SNI");
	}
	if (payload.protocol === "vless") {
		if (!payload.uuid) errors.push("VLESS 节点需要 UUID");
		if (!payload.sni) errors.push("VLESS 节点需要 SNI");
	}
	if (payload.protocol === "trojan") {
		if (!payload.password) errors.push("Trojan 节点需要密码");
		if (!payload.sni) errors.push("Trojan 节点建议填写 SNI");
	}
	if (payload.trafficMode !== "unlimited") {
		if (payload.trafficQuotaGb != null && Number.isNaN(payload.trafficQuotaGb)) {
			errors.push("请填写有效的总流量");
		}
		if (payload.trafficUsedGb != null && Number.isNaN(payload.trafficUsedGb)) {
			errors.push("请填写有效的已用流量");
		}
		if (payload.trafficResetDay != null) {
			if (Number.isNaN(payload.trafficResetDay) || payload.trafficResetDay < 1 || payload.trafficResetDay > 31) {
				errors.push("重置日需在 1 到 31 之间");
			}
		}
	}
	return errors;
}

function getGroupFormPayload() {
	const members = [...els.groupMembersEditor.querySelectorAll(".member-item[data-selected='1']")].map(
		(wrapper, index) => {
			const nodeId = wrapper.dataset.nodeId;
			const displayInput = wrapper.querySelector(".member-display-name");
			return {
				nodeId,
				displayName: displayInput?.value.trim() || "",
				sortOrder: (index + 1) * 10,
			};
		},
	);
	return {
		id: els.groupId.value || undefined,
		name: els.groupName.value.trim(),
		slug: normalizeSlug(els.groupSlug.value.trim()),
		subscriptionToken: els.groupToken.value.trim(),
		enabled: state.groups.find((item) => item.id === els.groupId.value)?.enabled ?? false,
		showTrafficInName:
			state.groups.find((item) => item.id === els.groupId.value)?.showTrafficInName ??
			els.groupForm.dataset.showTrafficInName === "1",
		members,
	};
}

function validateGroupPayload(payload) {
	const errors = [];
	if (!payload.name) errors.push("请填写分组名称");
	if (!payload.slug) errors.push("请填写合法 slug");
	if (!payload.subscriptionToken) errors.push("请填写订阅 Token");
	if (!payload.members.length) errors.push("请至少选择一个节点加入分组");
	return errors;
}

async function copyText(value, label) {
	const text = String(value || "");
	try {
		if (navigator.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
		} else {
			const input = document.createElement("textarea");
			input.value = text;
			document.body.appendChild(input);
			input.select();
			document.execCommand("copy");
			input.remove();
		}
		showToast(`${label}已复制`);
	} catch {
		showToast(`${label}复制失败`, "error");
	}
}

function downloadJson(filename, payload) {
	const blob = new Blob([JSON.stringify(payload, null, 2)], {
		type: "application/json;charset=utf-8",
	});
	downloadBlob(filename, blob);
}

function downloadBlob(filename, blob) {
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

async function fetchSubscriptionText(url) {
	const response = await fetch(url, { cache: "no-store" });
	if (!response.ok) {
		throw new Error(`订阅内容获取失败: ${response.status}`);
	}
	return response.text();
}

async function downloadSubscriptionFile(url, filename) {
	const content = await fetchSubscriptionText(url);
	downloadBlob(filename || "subscription.yaml", new Blob([content], { type: "text/yaml;charset=utf-8" }));
	showToast("YAML 文件已下载");
}

async function handleExport() {
	const payload = await api("/api/export");
	const stamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
	downloadJson(`npanel-export-${stamp}.json`, payload);
	showToast("已导出当前配置 JSON");
}

async function handleNodeDelete(id) {
	const node = state.nodes.find((item) => item.id === id);
	if (!node || !window.confirm(`确定删除节点“${node.name}”吗？`)) return;
	await api(`/api/nodes/${encodeURIComponent(id)}`, { method: "DELETE" });
	await loadDashboard();
	resetNodeForm();
	showToast("节点已删除");
}

async function handleGroupDelete(id) {
	const group = state.groups.find((item) => item.id === id);
	if (!group || !window.confirm(`确定删除分组“${group.name}”吗？`)) return;
	await api(`/api/groups/${encodeURIComponent(id)}`, { method: "DELETE" });
	await loadDashboard();
	resetGroupForm();
	showToast("分组已删除");
}

function handleNodeClone(id) {
	const node = state.nodes.find((item) => item.id === id);
	if (!node) return;
	fillNodeForm(buildNodeClone(node), "clone");
	setNodeEditorOpen(true);
	els.nodeEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
	showToast(`已载入“${node.name}”的克隆表单`);
}

function handleGroupClone(id) {
	const group = state.groups.find((item) => item.id === id);
	if (!group) return;
	fillGroupForm(buildGroupClone(group), "clone");
	setGroupEditorOpen(true);
	els.groupEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
	showToast(`已载入“${group.name}”的克隆表单`);
}

async function refreshSessionState() {
	const session = await api("/api/session");
	state.authConfigured = Boolean(session.authConfigured);
	state.usingDevAuthFallback = Boolean(session.usingDevAuthFallback);
	applyPanelBrand(session.settings?.brand || PANEL_CONFIG.brand);
	setAuthenticated(session.authenticated, session.storageMode);
	renderSystemStatus();
	return session;
}

async function loadDashboard() {
	const [summary, nodes, groups, checks] = await Promise.all([
		api("/api/dashboard"),
		api("/api/nodes"),
		api("/api/groups"),
		api("/api/checks"),
	]);
	state.nodes = nodes.items;
	state.groups = groups.items;
	state.checks = checks.items;
	updateStats(summary);
	renderNodes();
	renderGroups();
	renderChecks();
	renderGroupMembersEditor();
}

function escapeHtml(value) {
	return String(value)
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function formatTime(value) {
	if (!value) return "-";
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
}

function cssEscape(value) {
	return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

const systemThemeMedia = window.matchMedia?.("(prefers-color-scheme: light)") ?? null;

function syncSystemTheme() {
	if (state.theme.mode === "system") {
		applyTheme(state.theme, { commit: true });
		return;
	}
	if (!els.themeModal.hidden && state.themeDraft.mode === "system") {
		applyTheme(state.themeDraft);
	}
}

async function boot() {
	try {
		applyPanelBrand();
		const savedTheme = readSavedTheme();
		state.theme = savedTheme;
		state.themeDraft = { ...savedTheme };
		applyTheme(savedTheme, { commit: true });
		setNodeEditorOpen(false);
		setGroupEditorOpen(false);
		await refreshSessionState();
		resetNodeForm();
		resetGroupForm();
		if (state.authenticated) {
			await loadDashboard();
		}
	} catch (error) {
		showToast(error.message, "error");
	}
}

els.loginForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		await api("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ password: els.passwordInput.value }),
		});
		els.passwordInput.value = "";
		await refreshSessionState();
		await loadDashboard();
		showToast("登录成功");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.logoutButton.addEventListener("click", async () => {
	try {
		await api("/api/auth/logout", { method: "POST" });
		await refreshSessionState();
		resetNodeForm();
		resetGroupForm();
		showToast("已退出");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.themeSettingsButton.addEventListener("click", () => {
	openThemeModal();
});

els.themeCloseButton.addEventListener("click", closeThemeModal);
els.themeCancelButton.addEventListener("click", closeThemeModal);

els.themeResetButton.addEventListener("click", () => {
	state.themeDraft = { ...DEFAULT_THEME };
	applyTheme(state.themeDraft);
	els.brandInput.value = PANEL_CONFIG.brand;
	renderThemeOptions();
});

els.themeSaveButton.addEventListener("click", async () => {
	try {
		const normalized = normalizeTheme(state.themeDraft);
		const brand = els.brandInput.value.trim() || PANEL_CONFIG.brand;
		applyTheme(normalized, { commit: true });
		saveTheme(normalized);
		await api("/api/settings", {
			method: "PUT",
			body: JSON.stringify({ brand }),
		});
		applyPanelBrand(brand);
		closeThemeModal({ revert: false });
		showToast("设置已应用");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.themeModal.addEventListener("click", (event) => {
	const closeTrigger = event.target.closest("[data-action='close-theme']");
	if (closeTrigger) {
		closeThemeModal();
	}
});

els.qrCloseButton.addEventListener("click", closeQrModal);

els.qrModal.addEventListener("click", (event) => {
	const closeTrigger = event.target.closest("[data-action='close-qr']");
	if (closeTrigger) {
		closeQrModal();
	}
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape" && !els.qrModal.hidden) {
		closeQrModal();
		return;
	}
	if (event.key === "Escape" && !els.themeModal.hidden) {
		closeThemeModal();
	}
});

els.themeModeOptions.addEventListener("click", (event) => {
	const button = event.target.closest("[data-theme-mode]");
	if (!button) return;
	state.themeDraft.mode = button.dataset.themeMode;
	applyTheme(state.themeDraft);
	renderThemeOptions();
});

els.themeFamilyOptions.addEventListener("click", (event) => {
	const button = event.target.closest("[data-theme-family]");
	if (!button) return;
	const family = button.dataset.themeFamily;
	state.themeDraft.family = family;
	state.themeDraft.palette = THEME_OPTIONS[family].presets[0].id;
	applyTheme(state.themeDraft);
	renderThemeOptions();
});

els.themePaletteOptions.addEventListener("click", (event) => {
	const button = event.target.closest("[data-theme-palette]");
	if (!button) return;
	state.themeDraft.palette = button.dataset.themePalette;
	applyTheme(state.themeDraft);
	renderThemeOptions();
});

els.exportButton.addEventListener("click", async () => {
	try {
		await handleExport();
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.refreshButton.addEventListener("click", async () => {
	try {
		await refreshSessionState();
		await loadDashboard();
		showToast("数据已刷新");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.runChecksButton.addEventListener("click", async () => {
	try {
		els.runChecksButton.disabled = true;
		els.runChecksButton.textContent = "检测中...";
		await api("/api/checks/run", { method: "POST" });
		await loadDashboard();
		showToast("检测完成");
	} catch (error) {
		showToast(error.message, "error");
	} finally {
		els.runChecksButton.disabled = false;
		els.runChecksButton.textContent = "运行检测";
	}
});

els.newNodeButton.addEventListener("click", () => {
	if (state.nodeEditorOpen) {
		setNodeEditorOpen(false);
		return;
	}
	resetNodeForm();
	setNodeEditorOpen(true);
	els.nodeEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.newGroupButton.addEventListener("click", () => {
	if (state.groupEditorOpen) {
		setGroupEditorOpen(false);
		return;
	}
	resetGroupForm();
	setGroupEditorOpen(true);
	els.groupEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.resetNodeButton.addEventListener("click", () => {
	resetNodeForm();
});

els.resetGroupButton.addEventListener("click", () => {
	resetGroupForm();
});

els.nodeProtocol.addEventListener("change", () => {
	updateNodeProtocolHelp();
});

els.nodeTrafficMode.addEventListener("change", () => {
	updateNodeTrafficFields();
});

els.nodeManualToggleButton.addEventListener("click", () => {
	setNodeDetailOpen(els.nodeDetailFields.hidden);
});

els.nodeImportPasteButton.addEventListener("click", async () => {
	try {
		const text = await navigator.clipboard.readText();
		if (!text.trim()) {
			showToast("剪贴板里没有可读取的节点信息", "error");
			return;
		}
		els.nodeImportText.value = text;
		showToast("已读取剪贴板内容");
	} catch {
		showToast("读取剪贴板失败，请手动粘贴", "error");
	}
});

els.nodeImportParseButton.addEventListener("click", () => {
	try {
		const candidates = parseImportInput(els.nodeImportText.value);
		if (!candidates.length) {
			showToast("没有识别到可导入的节点信息", "error");
			clearImportCandidates();
			return;
		}
		state.nodeImportCandidates = candidates;
		renderImportCandidates();
		if (candidates.length === 1) {
			applyImportCandidate(0);
			return;
		}
		showToast(`已识别 ${candidates.length} 条节点配置`);
	} catch (error) {
		showToast(error.message, "error");
		clearImportCandidates();
	}
});

els.nodeImportApplyButton.addEventListener("click", () => {
	const index = Number(els.nodeImportSelect.value || 0);
	applyImportCandidate(index);
});

els.groupName.addEventListener("input", () => {
	if (!els.groupSlug.dataset.manual) {
		els.groupSlug.value = normalizeSlug(els.groupName.value);
	}
});

els.groupSlug.addEventListener("input", () => {
	els.groupSlug.dataset.manual = els.groupSlug.value ? "1" : "";
});

els.groupTokenGenerateButton.addEventListener("click", () => {
	els.groupToken.value = generateSubscriptionToken();
	showToast("已生成新的订阅 Token");
});

els.nodeSearchInput.addEventListener("input", renderNodes);
els.groupSearchInput.addEventListener("input", renderGroups);

els.nodeForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const payload = getNodeFormPayload();
		const errors = validateNodePayload(payload);
		if (errors.length) {
			showToast(errors[0], "error");
			return;
		}
		const method = payload.id ? "PUT" : "POST";
		const path = payload.id ? `/api/nodes/${encodeURIComponent(payload.id)}` : "/api/nodes";
		await api(path, {
			method,
			body: JSON.stringify(payload),
		});
		await loadDashboard();
		resetNodeForm();
		setNodeEditorOpen(false);
		showToast(payload.id ? "节点已更新" : "节点已创建");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.groupForm.addEventListener("submit", async (event) => {
	event.preventDefault();
	try {
		const payload = getGroupFormPayload();
		const errors = validateGroupPayload(payload);
		if (errors.length) {
			showToast(errors[0], "error");
			return;
		}
		const method = payload.id ? "PUT" : "POST";
		const path = payload.id ? `/api/groups/${encodeURIComponent(payload.id)}` : "/api/groups";
		await api(path, {
			method,
			body: JSON.stringify(payload),
		});
		await loadDashboard();
		resetGroupForm();
		setGroupEditorOpen(false);
		showToast(payload.id ? "分组已更新" : "分组已创建");
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.nodesTable.addEventListener("click", async (event) => {
	const button = event.target.closest("[data-action]");
	if (!button) return;
	const action = button.dataset.action;
	const id = button.dataset.id;
	if (!id) return;
	try {
		if (action === "clone-node") {
			handleNodeClone(id);
		}
		if (action === "edit-node") {
			const node = state.nodes.find((item) => item.id === id);
			fillNodeForm(node || null, "edit");
			setNodeEditorOpen(true);
			els.nodeEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
		}
		if (action === "delete-node") {
			await handleNodeDelete(id);
		}
		if (action === "toggle-node-enabled") {
			const node = state.nodes.find((item) => item.id === id);
			if (!node) return;
			await api(`/api/nodes/${encodeURIComponent(id)}`, {
				method: "PUT",
				body: JSON.stringify({
					...node,
					enabled: !node.enabled,
				}),
			});
			await loadDashboard();
			if (els.nodeId.value === id) {
				const saved = state.nodes.find((item) => item.id === id) || null;
				fillNodeForm(saved, "edit");
			}
			showToast(node.enabled ? "节点已停用" : "节点已启用");
		}
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.groupsList.addEventListener("click", async (event) => {
	const button = event.target.closest("[data-action]");
	if (!button) return;
	const action = button.dataset.action;
	const id = button.dataset.id;
	const value = button.dataset.value;
	const kind = button.dataset.kind;
	const filename = button.dataset.filename;
	try {
		if (action === "clone-group" && id) {
			handleGroupClone(id);
		}
		if (action === "edit-group" && id) {
			const group = state.groups.find((item) => item.id === id);
			fillGroupForm(group || null, "edit");
			setGroupEditorOpen(true);
			els.groupEditorSide.scrollIntoView({ behavior: "smooth", block: "start" });
		}
		if (action === "delete-group" && id) {
			await handleGroupDelete(id);
		}
		if (action === "copy-url" && value) {
			await copyText(value, kind || "链接");
		}
		if (action === "download-subscription-file" && value) {
			await downloadSubscriptionFile(value, filename || "subscription.yaml");
		}
		if (action === "show-qr" && value) {
			openQrModal(
				button.dataset.label || kind || "订阅二维码",
				value,
				button.dataset.hint || "使用客户端扫码导入当前订阅链接。",
			);
		}
		if (action === "copy-token" && value) {
			await copyText(value, kind || "Token");
		}
		if (action === "toggle-group-enabled" && id) {
			const group = state.groups.find((item) => item.id === id);
			if (!group) return;
			await api(`/api/groups/${encodeURIComponent(id)}`, {
				method: "PUT",
				body: JSON.stringify({
					...group,
					enabled: !group.enabled,
					members: group.members.map((member, index) => ({
						nodeId: member.nodeId,
						displayName: member.displayName || "",
						sortOrder: Number(member.sortOrder ?? (index + 1) * 10),
					})),
				}),
			});
			await loadDashboard();
			if (els.groupId.value === id) {
				const saved = state.groups.find((item) => item.id === id) || null;
				fillGroupForm(saved, "edit");
			}
			showToast(group.enabled ? "分组已停用" : "分组已启用");
		}
		if (action === "toggle-group-traffic-name" && id) {
			const group = state.groups.find((item) => item.id === id);
			if (!group) return;
			await api(`/api/groups/${encodeURIComponent(id)}`, {
				method: "PUT",
				body: JSON.stringify({
					...group,
					showTrafficInName: !group.showTrafficInName,
					members: group.members.map((member, index) => ({
						nodeId: member.nodeId,
						displayName: member.displayName || "",
						sortOrder: Number(member.sortOrder ?? (index + 1) * 10),
					})),
				}),
			});
			await loadDashboard();
			if (els.groupId.value === id) {
				const saved = state.groups.find((item) => item.id === id) || null;
				fillGroupForm(saved, "edit");
			}
			showToast(group.showTrafficInName ? "分组已隐藏流量标签" : "分组已显示流量标签");
		}
	} catch (error) {
		showToast(error.message, "error");
	}
});

els.groupMembersEditor.addEventListener("change", (event) => {
	const checkbox = event.target.closest(".member-toggle");
	if (!checkbox) return;
	const nodeId = checkbox.dataset.nodeId;
	const wrapper = checkbox.closest(".member-item");
	const displayInput = els.groupMembersEditor.querySelector(
		`.member-display-name[data-node-id="${cssEscape(nodeId)}"]`,
	);
	const sortInput = els.groupMembersEditor.querySelector(
		`.member-sort-order[data-node-id="${cssEscape(nodeId)}"]`,
	);
	if (displayInput) displayInput.disabled = !checkbox.checked;
	if (sortInput) sortInput.disabled = !checkbox.checked;
	if (sortInput) sortInput.readOnly = checkbox.checked;
	if (wrapper) {
		wrapper.classList.toggle("disabled", !checkbox.checked);
		wrapper.classList.toggle("is-selected", checkbox.checked);
		wrapper.classList.toggle("is-draggable", checkbox.checked);
		wrapper.dataset.selected = checkbox.checked ? "1" : "0";
		wrapper.draggable = checkbox.checked;
		const dragNote = wrapper.querySelector(".drag-note");
		if (dragNote) {
			dragNote.textContent = checkbox.checked
				? "拖拽排序"
				: wrapper.dataset.protocol || "";
		}
		insertMemberItemBySelectionOrder(wrapper, checkbox.checked);
	}
	syncSelectedMemberOrder();
});

els.groupMembersEditor.addEventListener("dragstart", (event) => {
	const item = event.target.closest(".member-item[data-selected='1']");
	if (!item) return;
	item.classList.add("dragging");
	event.dataTransfer.effectAllowed = "move";
	event.dataTransfer.setData("text/plain", item.dataset.nodeId || "");
});

els.groupMembersEditor.addEventListener("dragend", (event) => {
	const item = event.target.closest(".member-item");
	if (!item) return;
	item.classList.remove("dragging");
	syncSelectedMemberOrder();
});

els.groupMembersEditor.addEventListener("dragover", (event) => {
	const target = event.target.closest(".member-item[data-selected='1']");
	const dragging = els.groupMembersEditor.querySelector(".member-item.dragging");
	if (!target || !dragging || target === dragging) return;
	event.preventDefault();
	const rect = target.getBoundingClientRect();
	const insertAfter = event.clientY > rect.top + rect.height / 2;
	if (insertAfter) {
		target.after(dragging);
	} else {
		target.before(dragging);
	}
});

els.groupMembersEditor.addEventListener("drop", (event) => {
	if (event.target.closest(".member-item[data-selected='1']")) {
		event.preventDefault();
		syncSelectedMemberOrder();
	}
});

if (systemThemeMedia) {
	if (typeof systemThemeMedia.addEventListener === "function") {
		systemThemeMedia.addEventListener("change", syncSystemTheme);
	} else if (typeof systemThemeMedia.addListener === "function") {
		systemThemeMedia.addListener(syncSystemTheme);
	}
}

boot();




