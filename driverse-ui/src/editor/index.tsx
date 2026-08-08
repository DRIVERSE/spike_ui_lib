/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/editor/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/editor/index.tsx
 * @status decoupled
 * @notes Byte-identical in both apps, but unusable as shipped: react-quill@2 renders through
 *        ReactDOM.findDOMNode, which React 19 removed — the apps' editor is broken on their own runtime
 *        today. Swapped to react-quill-new, the maintained fork with the same public API, which
 *        peer-declares react ^19. The only source change is the import specifier.
 *        Also adds the explicit quill.snow.css import the apps got from a global stylesheet, so the
 *        component is self-contained. Optional peer: react-quill-new. Subpath export "./editor",
 *        which is why it lives at src/editor/ rather than under src/components/.
 */

import "@/utils/highlight";
import type { ComponentProps } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { StyledEditor } from "./styles";
import Toolbar, { formats } from "./toolbar";

/** react-quill-new keeps ReactQuillProps inside a namespace rather than exporting it. */
type ReactQuillProps = ComponentProps<typeof ReactQuill>;

interface Props extends ReactQuillProps {
	sample?: boolean;
}

export default function Editor({ id = "slash-quill", sample = false, ...other }: Props) {
	const modules = {
		toolbar: {
			container: `#${id}`,
		},
		history: {
			delay: 500,
			maxStack: 100,
			userOnly: true,
		},
		syntax: true,
		clipboard: {
			matchVisual: false,
		},
	};
	return (
		<StyledEditor>
			<Toolbar id={id} isSimple={sample} />
			<ReactQuill modules={modules} formats={formats} {...other} placeholder="Write something awesome..." />
		</StyledEditor>
	);
}
