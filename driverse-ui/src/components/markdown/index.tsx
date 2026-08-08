/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/markdown/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/markdown/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. The props type moves off react-markdown 8's
 *        deep `react-markdown/lib/react-markdown` import onto the package's own exported Options.
 *        The apps pin react-markdown 8, whose types reference the pre-React-19 global JSX namespace and
 *        therefore do not compile under @types/react 19 — the same failure framer-motion 10 has. The
 *        library needs react-markdown >= 9 (with remark-gfm 4 / rehype-raw 7 / rehype-highlight 7);
 *        an app upgrade at adoption, tracked in docs/CONSUMING.md.
 *        react-markdown / remark-gfm / rehype-raw / rehype-highlight are optional peers — only importers
 *        of this component need them. `@/utils/highlight` is imported for its side effect, exactly as in
 *        the apps: it configures highlight.js and publishes it on window for rehype-highlight.
 */

import ReactMarkdown, { type Options } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import "@/utils/highlight";
import StyledMarkdown from "./styles";

type Props = Options;

export default function Markdown({ children }: Props) {
	return (
		<StyledMarkdown>
			<ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]} remarkPlugins={[[remarkGfm, { singleTilde: false }]]}>
				{children}
			</ReactMarkdown>
		</StyledMarkdown>
	);
}
