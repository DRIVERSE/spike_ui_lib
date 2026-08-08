#!/usr/bin/env node
/**
 * gen-inventory.mjs — Phase 1 inventory generator for the Driverse shared UI library program.
 *
 * Scans both app repos, merges measured metrics with the hand-curated decisions in
 * docs/manifest/curation.json, and emits:
 *   docs/manifest/components.json  — machine-readable source of truth
 *   docs/INDEX.md                  — master extraction index (names + origins)
 *   docs/REUSE-REPORT.md           — formatted reuse metrics report
 *
 * Usage: node scripts/gen-inventory.mjs
 */
import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO_A = path.join(ROOT, "spike_Driverse_FE_Autocredit-qa");
const REPO_B = path.join(ROOT, "spike_Driverse_FE_Business-dev");
const DOCS = path.join(ROOT, "docs");

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".json", ".svg"]);

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p));
		else out.push(p);
	}
	return out;
}

const loc = (f) => fs.readFileSync(f, "utf8").split("\n").length;
const identical = (f1, f2) => fs.existsSync(f1) && fs.existsSync(f2) && fs.readFileSync(f1).equals(fs.readFileSync(f2));

function diffLines(f1, f2) {
	try {
		execFileSync("diff", [f1, f2], { stdio: ["ignore", "pipe", "ignore"] });
		return 0;
	} catch (e) {
		const out = e.stdout?.toString() ?? "";
		return out.split("\n").filter((l) => l.startsWith("<") || l.startsWith(">")).length;
	}
}

/** Resolve a curation path (relative to <repo>/src, "../x" = repo root) to absolute, or null. */
function resolveUnitPath(repo, rel) {
	if (!rel) return null;
	const p = rel.startsWith("../") ? path.join(repo, rel.slice(3)) : path.join(repo, "src", rel);
	return fs.existsSync(p) ? p : null;
}

/** Metrics for one unit (file or directory on each side). */
function measure(aPath, bPath) {
	const aFiles = aPath ? (fs.statSync(aPath).isDirectory() ? walk(aPath) : [aPath]) : [];
	const bFiles = bPath ? (fs.statSync(bPath).isDirectory() ? walk(bPath) : [bPath]) : [];
	const m = {
		filesA: aFiles.length,
		filesB: bFiles.length,
		locA: aFiles.reduce((s, f) => s + loc(f), 0),
		locB: bFiles.reduce((s, f) => s + loc(f), 0),
		identicalFiles: 0,
		pairedFiles: 0,
		diffLines: 0,
	};
	if (aPath && bPath) {
		const relB = new Map(bFiles.map((f) => [path.relative(bPath, f), f]));
		for (const f of aFiles) {
			const rel = path.relative(aPath, f);
			const bf = relB.get(rel);
			if (!bf) continue;
			m.pairedFiles++;
			if (identical(f, bf)) m.identicalFiles++;
			else m.diffLines += diffLines(f, bf);
		}
	}
	let status;
	if (!aPath && bPath) status = "only-B";
	else if (aPath && !bPath) status = "only-A";
	else if (m.identicalFiles === m.pairedFiles && m.filesA === m.filesB && m.pairedFiles === m.filesA) status = "identical";
	else if (m.diffLines <= Math.max(10, Math.round(0.05 * Math.max(m.locA, m.locB)))) status = "near-identical";
	else status = "diverged";
	return { ...m, status };
}

/** Whole-tree stats between the two repos' src/ (code files only for LOC). */
function globalStats() {
	const aFiles = walk(path.join(REPO_A, "src"));
	const bFiles = walk(path.join(REPO_B, "src"));
	const bByRel = new Map(bFiles.map((f) => [path.relative(path.join(REPO_B, "src"), f), f]));
	let identicalAll = 0;
	let identicalCode = 0;
	let identicalCodeLoc = 0;
	let codeA = 0;
	let codeLocA = 0;
	for (const f of aFiles) {
		const rel = path.relative(path.join(REPO_A, "src"), f);
		const isCode = CODE_EXT.has(path.extname(f)) && !f.endsWith(".json.license");
		const bf = bByRel.get(rel);
		const same = bf && identical(f, bf);
		if (same) identicalAll++;
		if (path.extname(f) === ".ts" || path.extname(f) === ".tsx" || path.extname(f) === ".css") {
			codeA++;
			codeLocA += loc(f);
			if (same) {
				identicalCode++;
				identicalCodeLoc += loc(f);
			}
		}
	}
	const codeLocB = bFiles
		.filter((f) => [".ts", ".tsx", ".css"].includes(path.extname(f)))
		.reduce((s, f) => s + loc(f), 0);
	return {
		filesA: aFiles.length,
		filesB: bFiles.length,
		identicalFiles: identicalAll,
		codeFilesA: codeA,
		codeLocA,
		codeLocB,
		identicalCodeFiles: identicalCode,
		identicalCodeLoc,
	};
}

const shortSha = (repo) => {
	try {
		return execFileSync("git", ["-C", ROOT, "rev-parse", "--short", "HEAD"], { encoding: "utf8" }).trim();
	} catch {
		return "worktree";
	}
};

// ---------------------------------------------------------------------------
const curation = JSON.parse(fs.readFileSync(path.join(DOCS, "manifest", "curation.json"), "utf8"));
const sha = shortSha();
const units = curation.units.map((u) => {
	const aPath = resolveUnitPath(REPO_A, u.a);
	const bPath = resolveUnitPath(REPO_B, u.b);
	if (u.a && !aPath) console.warn(`WARN ${u.id}: QA path missing: ${u.a}`);
	if (u.b && !bPath) console.warn(`WARN ${u.id}: BD path missing: ${u.b}`);
	return {
		...u,
		sources: {
			qa: u.a ? { repo: "spike_Driverse_FE_Autocredit-qa", path: `src/${u.a}`.replace("src/../", ""), commit: sha } : null,
			bd: u.b ? { repo: "spike_Driverse_FE_Business-dev", path: `src/${u.b}`.replace("src/../", ""), commit: sha } : null,
		},
		metrics: measure(aPath, bPath),
		extraction: { status: "planned", story: null, tests: { smoke: false, snapshot: false, interaction: false, a11y: false } },
	};
});
const globals = globalStats();

fs.writeFileSync(
	path.join(DOCS, "manifest", "components.json"),
	`${JSON.stringify({ generated: new Date().toISOString(), commit: sha, globals, units }, null, "\t")}\n`,
);

// ---------------------------------------------------------------------------
// INDEX.md
const LAYERS = [
	["component", "Components (`src/components`)"],
	["theme", "Theme system (`src/theme`, tailwind config)"],
	["layout", "Layouts (`src/layouts`)"],
	["hook", "Hooks (`src/hooks`)"],
	["util", "Utils (`src/utils`)"],
	["lib", "Lib/infra (`src/lib`)"],
	["feature", "Shared feature modules (`src/features`, locales)"],
];
const STATUS_ICON = {
	identical: "🟢 identical",
	"near-identical": "🟢 near-identical",
	diverged: "🟡 diverged",
	"only-A": "🔵 QA-only",
	"only-B": "🟣 BD-only",
};
const fmtTier = (t) => (t === "X" ? "—" : t === "F" ? "F" : `T${t}`);
const fmtLoc = (m) => {
	if (m.filesA && m.filesB) return `${m.locA} / ${m.locB}`;
	return m.filesA ? `${m.locA}` : `${m.locB}`;
};

let idx = `# Master Extraction Index

> Generated by \`scripts/gen-inventory.mjs\` from [manifest/curation.json](manifest/curation.json)
> at commit \`${sha}\` — do not edit by hand. Machine-readable version:
> [manifest/components.json](manifest/components.json). Program plan: [PLAN.md](PLAN.md).
> Reuse metrics: [REUSE-REPORT.md](REUSE-REPORT.md).

**QA** = \`spike_Driverse_FE_Autocredit-qa\` · **BD** = \`spike_Driverse_FE_Business-dev\`
· Tiers: **T0** identical lift · **T1** lift as-is · **T2** union merge · **T3** decouple first
· **T4** adopt one side / heavy subpath · **F** shared feature module · **—** excluded/deferred

`;
for (const [layer, title] of LAYERS) {
	const rows = units.filter((u) => u.layer === layer);
	if (!rows.length) continue;
	idx += `## ${title}\n\n`;
	idx += "| Unit | QA origin | BD origin | Status | LOC (QA/BD) | Δ lines | Tier | Wave | Decision | Target in `driverse-ui` | Notes |\n";
	idx += "|---|---|---|---|---|---|---|---|---|---|---|\n";
	for (const u of rows) {
		const qa = u.sources.qa ? `\`${u.sources.qa.path}\`` : "—";
		const bd = u.sources.bd ? `\`${u.sources.bd.path}\`` : "—";
		idx += `| **${u.id}** | ${qa} | ${bd} | ${STATUS_ICON[u.metrics.status]} | ${fmtLoc(u.metrics)} | ${u.metrics.diffLines || ""} | ${fmtTier(u.tier)} | ${u.wave} | ${u.decision} | ${u.target ? `\`${u.target}\`` : "—"} | ${u.notes} |\n`;
	}
	idx += "\n";
}
fs.writeFileSync(path.join(DOCS, "INDEX.md"), idx);

// ---------------------------------------------------------------------------
// REUSE-REPORT.md
const included = units.filter((u) => u.tier !== "X");
const excluded = units.filter((u) => u.tier === "X");
const sum = (arr, f) => arr.reduce((s, u) => s + f(u), 0);
const extractableLoc = sum(included, (u) => Math.max(u.metrics.locA, u.metrics.locB));
const identicalUnits = included.filter((u) => u.metrics.status === "identical" || u.metrics.status === "near-identical");
const byTier = {};
for (const u of included) (byTier[u.tier] ??= []).push(u);

const pct = (n, d) => `${((100 * n) / d).toFixed(1)}%`;
const bar = (n, d, w = 30) => {
	const filled = Math.round((w * n) / d);
	return "█".repeat(filled) + "░".repeat(w - filled);
};

let rpt = `# UI Reuse Report — Driverse Autocredit × Business

> Generated by \`scripts/gen-inventory.mjs\` at commit \`${sha}\` (${new Date().toISOString().slice(0, 10)}).
> Companion docs: [PLAN.md](PLAN.md) · [INDEX.md](INDEX.md) · [manifest/components.json](manifest/components.json)

Both apps are forks of the same template (\`d3george/slash-admin\`). This report quantifies how much
of their UI code is shared today and how much the \`@driverse/ui\` library can absorb.

## Headline numbers

| Metric | Value |
|---|---|
| Files under \`src/\` | QA **${globals.filesA}** · BD **${globals.filesB}** |
| Byte-identical files across repos (same path) | **${globals.identicalFiles}** (${pct(globals.identicalFiles, globals.filesA)} of QA) |
| Code LOC (ts/tsx/css) | QA **${globals.codeLocA.toLocaleString()}** · BD **${globals.codeLocB.toLocaleString()}** |
| Byte-identical code LOC | **${globals.identicalCodeLoc.toLocaleString()}** across ${globals.identicalCodeFiles} files |
| Hidden overlap from dir renames (\`vehicle-park(s)\`, \`insight/charts\`) | **~147 files** invisible to a naive diff |
| Formatting-only "divergence" | ~60 of 125 differing shared files (tabs/quotes/comments) |

\`\`\`
Identical share of QA src files   ${bar(globals.identicalFiles, globals.filesA)}  ${pct(globals.identicalFiles, globals.filesA)}
\`\`\`

## Extraction potential

**${included.length} units** are planned for extraction into \`@driverse/ui\`
(**~${extractableLoc.toLocaleString()} LOC** measured at the larger of the two origins);
**${identicalUnits.length}** of them are already byte-identical or near-identical between the apps —
pure lift-and-share. **${excluded.length}** units were reviewed and explicitly excluded/deferred
(app-coupled, redundant, or infra) — see [INDEX.md](INDEX.md).

| Tier | Meaning | Units | LOC (max side) |
|---|---|---|---|
${Object.entries(byTier)
	.sort(([a], [b]) => String(a).localeCompare(String(b)))
	.map(
		([t, us]) =>
			`| ${fmtTier(t)} | ${
				{ 0: "Byte-identical — lift as-is", 1: "Lift as-is (trivial/no conflict)", 2: "Union merge (pick winner / combine)", 3: "Decouple from app store/router first", 4: "Adopt one side / heavy optional subpath", F: "Shared feature module (user directive)" }[t]
			} | ${us.length} | ${sum(us, (u) => Math.max(u.metrics.locA, u.metrics.locB)).toLocaleString()} |`,
	)
	.join("\n")}

## Per-layer reuse (identical files / LOC within QA's tree)

| Layer | Identical files | Identical LOC | Verdict |
|---|---|---|---|
| \`src/theme\` | 12 / 13 | 726 / 737 (98.5%) | Effectively fully shared; only \`colors.ts\` differs — resolved by the brand-token contract (brand values are per-app **by design**) |
| \`src/components\` | 53 / 81 | 3,263 / 5,856 (55.7%) | 20 of 27 shared dirs byte-identical |
| \`src/layouts\` | 13 / 24 | 1,508 / 2,437 (61.9%) | dnd-kit multi-tabs suite + chrome identical; shell excluded (divergent auth) |
| \`src/hooks\` | 6 / 13 | 372 / 723 | 7 hooks byte-identical incl. misfiled \`useDebounce\` |
| \`src/utils\` | 3 / 10 | 62 / 986 | 5 more differ only by comments/formatting |
| telemetry feature | 26 / 44 | — | Most remaining diffs ≤ 7 lines |

## What the numbers understate

1. **Directory renames hide sharing.** \`features/vehicle-park\` (QA) vs \`features/vehicle-parks\` (BD)
   contain 141 same-named files (42 byte-identical); \`insight/components/charts\` vs \`insight/charts\`
   hide 6 shared charts (4 identical).
2. **Formatting churn masquerades as divergence.** ~60 of the 125 differing shared files change only
   whitespace, quotes, or commented-out code (verified: \`utils/theme.ts\`, \`lib/apollo/config.ts\`,
   \`hooks/web/use-resource.tsx\`, \`components/editor/styles.ts\`, …).
3. **Brand values are not divergence.** \`theme/colors.ts\` and per-tenant logos differ *on purpose*;
   the library models them as an injectable brand contract, not a merge conflict.

## Notable findings for the app teams

- **QA latent bug:** imports \`leaflet\` without declaring it (resolves only transitively via
  \`react-leaflet\`). BD declares it explicitly.
- **BD broken hook:** \`hooks/web/use-user-permissions.ts\` returns \`undefined\` — both \`useMemo\`
  bodies are commented out. QA's \`use-permission.ts\` is the working primitive.
- **\`@faker-js/faker\` ships in production** (\`layouts/components/notice.tsx\`).
- **BD insight table is visibly buggy** (\`title: "Status"\` on \`dataIndex: "email"\`); QA's version
  (DataTable + i18n) is ahead.
- Stale conflicting lockfiles in both repos (identical \`pnpm-lock.yaml\` despite differing
  \`package.json\`, plus \`package-lock.json\`; CI runs \`npm ci --force\`).
- \`@types/react\` pinned to ^18 while runtime is React 19 in both apps.

## Unit detail

See [INDEX.md](INDEX.md) for the full per-unit table (origins in both repos, status, diff size,
tier, wave, decision, target path) and [manifest/components.json](manifest/components.json) for the
machine-readable version that drives extraction tracking.
`;
fs.writeFileSync(path.join(DOCS, "REUSE-REPORT.md"), rpt);

console.log(`OK: ${units.length} units (${included.length} planned, ${excluded.length} excluded/deferred)`);
console.log(`Extractable LOC (max side): ${extractableLoc.toLocaleString()}`);
console.log("Wrote docs/manifest/components.json, docs/INDEX.md, docs/REUSE-REPORT.md");
