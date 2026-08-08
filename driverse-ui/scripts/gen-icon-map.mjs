#!/usr/bin/env node
/**
 * gen-icon-map.mjs — regenerates src/icons/svg-map.ts from the SVG files in src/icons/svg/.
 *
 * The apps compiled these into a sprite with vite-plugin-svg-icons and referenced symbols via
 * `<use xlink:href="#icon-name">`, which forced every consumer to install and configure that plugin.
 * The library instead compiles each file to a React component with vite-plugin-svgr at build time and
 * looks it up in a plain name -> component map, so consuming apps need no host plugin at all.
 *
 * Run after adding or removing an SVG: `node scripts/gen-icon-map.mjs`
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const LIB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SVG_DIR = path.join(LIB, "src", "icons", "svg");
const OUT = path.join(LIB, "src", "icons", "svg-map.ts");

const names = fs
	.readdirSync(SVG_DIR)
	.filter((f) => f.endsWith(".svg"))
	.map((f) => f.slice(0, -4))
	.sort();

if (names.length === 0) {
	console.error(`No SVGs found in ${SVG_DIR}`);
	process.exit(1);
}

/** "ic-file_pdf" -> "SvgIcFilePdf" */
const toIdentifier = (name) =>
	`Svg${name
		.split(/[-_]/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join("")}`;

const identifiers = new Map();
for (const name of names) {
	const id = toIdentifier(name);
	if (identifiers.has(id)) {
		console.error(`Identifier collision: "${name}" and "${identifiers.get(id)}" both map to ${id}`);
		process.exit(1);
	}
	identifiers.set(id, name);
}

const imports = names.map((name) => `import ${toIdentifier(name)} from "./svg/${name}.svg?react";`).join("\n");
const entries = names.map((name) => `\t"${name}": ${toIdentifier(name)},`).join("\n");

const out = `/** @lib-native */

/**
 * GENERATED FILE — do not edit by hand. Run \`node scripts/gen-icon-map.mjs\` after changing src/icons/svg/.
 *
 * Replaces the apps' vite-plugin-svg-icons sprite: every SVG is compiled to a React component by
 * vite-plugin-svgr and looked up by its file name, so consumers need no build-time host plugin.
 */
import type { ComponentType, SVGProps } from "react";

${imports}

export type SvgIconName = keyof typeof svgIconMap;

export const svgIconMap = {
${entries}
} satisfies Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

/** All available icon names, sorted — handy for galleries and for validating name drift. */
export const svgIconNames = Object.keys(svgIconMap) as SvgIconName[];
`;

fs.writeFileSync(OUT, out);
console.log(`svg-map.ts: ${names.length} icons`);
