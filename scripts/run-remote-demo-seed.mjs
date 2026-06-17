import { spawn } from "node:child_process";

const CONFIRM_FLAG = "--confirm-remote-demo-seed";
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
	console.log(`Remote demo seed runner

Usage:
  npm run db:remote:seed:demo -- ${CONFIRM_FLAG}

What it does:
  - executes ./database/0002_seed_demo.sql against the remote D1 database
  - clears old demo rows and writes example data

Safety:
  - this command refuses to run unless ${CONFIRM_FLAG} is provided
`);
	process.exit(0);
}

if (!args.includes(CONFIRM_FLAG)) {
	console.error(`Refusing to run remote demo seed without explicit confirmation.

This command writes demo data to the remote D1 database and can overwrite existing demo rows.

To continue, run:
  npm run db:remote:seed:demo -- ${CONFIRM_FLAG}
`);
	process.exit(1);
}

const child = spawn(
	process.platform === "win32" ? "npx.cmd" : "npx",
	[
		"wrangler",
		"d1",
		"execute",
		"npanel",
		"--remote",
		"--file=./database/0002_seed_demo.sql",
	],
	{
		stdio: "inherit",
		shell: false,
	},
);

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}
	process.exit(code ?? 1);
});

child.on("error", (error) => {
	console.error("Failed to start wrangler remote demo seed:", error.message);
	process.exit(1);
});
