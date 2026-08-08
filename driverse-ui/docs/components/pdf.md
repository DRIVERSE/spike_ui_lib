# PDF renderer (`@driverse/ui/pdf`)

Business-only (Autocredit has no PDF viewer). 489 LOC lifted essentially verbatim: thumbnails with
IntersectionObserver lazy loading, scroll synchronisation between the thumbnail rail and the document,
zoom, page input and load progress.

## The one decoupling: the pdf.js worker

Business set the worker at module scope:

```ts
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

Importing the renderer therefore pinned every consumer to a third-party CDN, with no override — bad for
offline installs, air-gapped deployments and strict CSP. That assignment now lives in `worker.ts` behind
`configurePdfWorker()`, which **defaults to the same unpkg URL**, so nothing changes unless an app opts out:

```ts
import { configurePdfWorker } from "@driverse/ui/pdf";
configurePdfWorker("/pdf.worker.min.mjs"); // once at startup, before the first render
```

It is idempotent, so a later import cannot clobber the app's choice.

## React 19 fix

Two ref callbacks were written `ref={(el) => (documentPagesRef.current[i] = el)}`, which returns the
assigned element. React 19 treats a ref callback's return value as a cleanup function, so these would
have thrown on unmount. Both now use a block body.

## Testing note

`pdf.test.tsx` covers `worker.ts` only. The viewer itself does not settle in jsdom — pdf.js needs a real
worker and canvas, and the thumbnail IntersectionObserver plus scroll handlers spin without real layout,
which hangs the test runner. The viewer is exercised in the Storybook build instead. If you need
regression coverage on the shell, a browser-mode Vitest project (Playwright provider) is the way in, not
more jsdom mocking.
