/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/scrollbar/index.tsx
 *   B: Driverse_FE_Business   @ b96eda3 src/components/scrollbar/index.tsx
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim. Only the `cn` import path changed.
 *        https://www.npmjs.com/package/simplebar-react?activeTab=readme
 */

import { cn } from "@/utils/cn";
import { forwardRef } from "react";
import SimpleBar, { type Props as SimplebarProps } from "simplebar-react";
import styled from "styled-components";

export type ScrollbarProps = SimplebarProps & {
	fillContainer?: boolean;
};

const Scrollbar = forwardRef<HTMLElement, ScrollbarProps>(
	({ children, className, fillContainer = true, ...other }, ref) => {
		return (
			<ScrollbarRoot
				fillContainer={fillContainer}
				scrollableNodeProps={{ ref }}
				clickOnTrack={false}
				{...other}
				className={cn("", className)}
			>
				{children}
			</ScrollbarRoot>
		);
	},
);
Scrollbar.displayName = "Scrollbar";

export default Scrollbar;

const ScrollbarRoot = styled(SimpleBar).withConfig({
	shouldForwardProp: (prop: string) => !["fillContainer"].includes(prop),
	displayName: "ScrollbarRoot",
})<Pick<ScrollbarProps, "fillContainer">>`
  min-width: 0;
  min-height: 0;
  max-height: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  ${({ fillContainer }) =>
		fillContainer &&
		`
    & .simplebar-content {
      display: flex;
      flex: 1 1 auto;
      min-height: 100%;
      flex-direction: column;
    }
  `}
`;
