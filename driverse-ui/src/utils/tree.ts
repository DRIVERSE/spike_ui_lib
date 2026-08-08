/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/utils/tree.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/utils/tree.ts
 * @status identical
 * @notes Byte-identical in both apps. One substitution: the apps used ramda's `chain`, which is exactly
 *        Array.prototype.flatMap for arrays. Inlining it keeps behaviour identical and spares consumers
 *        a ramda peer dependency for a single three-line function.
 */

/**
 * Flatten an array containing a tree structure
 * @param {T[]} trees - An array containing a tree structure
 * @returns {T[]} - Flattened array
 */
export function flattenTrees<T extends { children?: T[] }>(trees: T[] = []): T[] {
	return trees.flatMap((node) => [node, ...flattenTrees(node.children || [])]);
}
