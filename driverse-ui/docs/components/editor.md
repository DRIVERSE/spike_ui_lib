# Editor

## The react-quill problem

Both apps import `react-quill@2`, which renders through `ReactDOM.findDOMNode`. React 19 removed
`findDOMNode`, so **the editor is broken in both apps on their own runtime today** — this was flagged as
risk #1 in the program plan and is confirmed.

## What the library ships

`src/editor` (subpath `@driverse/ui/editor`) is the same component against
[`react-quill-new`](https://www.npmjs.com/package/react-quill-new) `^3.4`, the maintained fork. It
peer-declares `react ^19`, and the port needed exactly one source change: the import specifier. The
toolbar and the styled-components theme are byte-identical to the apps'.

Two additions:

- `react-quill-new/dist/quill.snow.css` is imported by the component. The apps relied on a global
  stylesheet for this, so the component was not self-contained.
- `ReactQuillProps` is derived with `ComponentProps<typeof ReactQuill>` because react-quill-new keeps the
  interface inside a namespace rather than exporting it.

## Verified

`src/editor/editor.test.tsx` mounts the editor under React 19 in jsdom and asserts that `.ql-container`
and `.ql-editor` render with the passed content — i.e. no `findDOMNode` path is hit. It also checks the
toolbar is bound by `id` and trims in `sample` mode.

## Migration

Replace `react-quill` with `react-quill-new` in the app's package.json. The component API is unchanged,
so call sites do not move.
