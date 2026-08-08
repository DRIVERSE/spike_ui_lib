#!/usr/bin/env node
/**
 * gen-iconify-bundle.mjs — regenerates src/icons/iconify-bundle.ts.
 *
 * The apps let @iconify/react fetch icon data from the public Iconify API at runtime. That is a network
 * dependency in Storybook, in tests and in any air-gapped environment. This script scans BOTH app repos
 * *and the library's own src/* for the `prefix:name` icon strings they use, extracts exactly those icons
 * out of @iconify/json, and emits a module that registers them with `addCollection()`.
 *
 * Scanning the library matters: components extracted here swap react-icons and @ant-design/icons glyphs
 * for Iconify equivalents, and those names exist in no app repo.
 *
 * Run when the apps start using new icons: `node scripts/gen-iconify-bundle.mjs`
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROGRAM = path.join(LIB, "..");
const SCAN_DIRS = [
	path.join(PROGRAM, "spike_Driverse_FE_Autocredit-qa", "src"),
	path.join(PROGRAM, "spike_Driverse_FE_Business-dev", "src"),
	path.join(LIB, "src"),
];
const JSON_DIR = path.join(LIB, "node_modules", "@iconify", "json", "json");
const OUT = path.join(LIB, "src", "icons", "iconify-bundle.ts");

// `icon="solar:pen-bold"`, `icon={"mdi:circle"}`, `icon: "lucide:x"`, and bare "prefix:name" strings in
// config maps (STATUS_CONFIG, nav trees). Over-collecting is harmless: names that do not resolve against
// @iconify/json are dropped below.
const ICON_RE = /["']([a-z0-9][a-z0-9-]*):([a-z0-9][a-z0-9_-]*)["']/g;

function walk(dir) {
	if (!fs.existsSync(dir)) return [];
	const out = [];
	for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, e.name);
		if (e.isDirectory()) out.push(...walk(p));
		else if (/\.(ts|tsx)$/.test(e.name) && e.name !== "iconify-bundle.ts") out.push(p);
	}
	return out;
}

const candidates = new Map(); // prefix -> Set<name>
let scanned = 0;
for (const scanDir of SCAN_DIRS) {
	const files = walk(scanDir);
	if (files.length === 0) {
		console.error(`Source not found: ${scanDir} — run this from the program repo.`);
		process.exit(1);
	}
	scanned += files.length;
	for (const file of files) {
		const source = fs.readFileSync(file, "utf8");
		for (const [, prefix, name] of source.matchAll(ICON_RE)) {
			if (!candidates.has(prefix)) candidates.set(prefix, new Set());
			candidates.get(prefix).add(name);
		}
	}
}

const collections = [];
let kept = 0;
let dropped = 0;
for (const [prefix, names] of [...candidates].sort(([a], [b]) => a.localeCompare(b))) {
	const file = path.join(JSON_DIR, `${prefix}.json`);
	if (!fs.existsSync(file)) {
		dropped += names.size;
		continue;
	}
	const source = JSON.parse(fs.readFileSync(file, "utf8"));
	const icons = {};
	const aliases = {};

	for (const name of [...names].sort()) {
		if (source.icons?.[name]) {
			icons[name] = source.icons[name];
			kept++;
			continue;
		}
		// Follow the alias chain until it lands on a real icon; ship both ends.
		let cursor = name;
		const chain = [];
		while (source.aliases?.[cursor] && chain.length < 10) {
			chain.push(cursor);
			cursor = source.aliases[cursor].parent;
		}
		if (chain.length > 0 && source.icons?.[cursor]) {
			icons[cursor] = source.icons[cursor];
			for (const alias of chain) aliases[alias] = source.aliases[alias];
			kept++;
		} else {
			dropped++;
		}
	}

	if (Object.keys(icons).length === 0) continue;
	const collection = { prefix, icons };
	if (Object.keys(aliases).length > 0) collection.aliases = aliases;
	for (const key of ["width", "height", "left", "top", "rotate", "hFlip", "vFlip"]) {
		if (source[key] !== undefined) collection[key] = source[key];
	}
	collections.push(collection);
}

// The payload is embedded as a JSON string rather than an object literal: it parses faster, keeps the
// generated file to a handful of lines, and stops the formatter from exploding it into 10k lines.
const payload = JSON.stringify(JSON.stringify(collections));

const out = `/** @lib-native */

/**
 * GENERATED FILE — do not edit by hand. Run \`node scripts/gen-iconify-bundle.mjs\` to refresh.
 *
 * Offline Iconify data for every \`prefix:name\` the two apps use, extracted from @iconify/json.
 * Importing this module registers the icons with @iconify/react, so <Iconify> resolves locally instead
 * of calling the public Iconify API. Storybook and the test setup import it; apps can too, via the
 * "@driverse/ui/icons/offline" subpath.
 */
import { type IconifyJSON, addCollection } from "@iconify/react";

const collections: IconifyJSON[] = JSON.parse(${payload});

for (const collection of collections) {
	addCollection(collection);
}

/** Icon names registered by this bundle, as "prefix:name". */
export const offlineIconNames: string[] = collections.flatMap((collection) => [
	...Object.keys(collection.icons ?? {}),
	...Object.keys(collection.aliases ?? {}),
].map((name) => \`\${collection.prefix}:\${name}\`));
`;

fs.writeFileSync(OUT, out);
console.log(
	`iconify-bundle.ts: ${kept} icons across ${collections.length} collections ` +
		`(${dropped} unresolved candidates dropped; ${scanned} files scanned; ${(payload.length / 1024).toFixed(0)} kB)`,
);
