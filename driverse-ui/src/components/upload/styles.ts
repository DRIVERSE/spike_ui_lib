/**
 * @extracted-from
 *   A: Driverse_FE_Autocredit @ b96eda3 src/components/upload/styles.ts
 *   B: Driverse_FE_Business   @ b96eda3 src/components/upload/styles.ts
 * @status identical
 * @notes Byte-identical in both apps; lifted verbatim.
 */

import styled from "styled-components";

export const StyledUpload = styled.div<{ $thumbnail?: boolean }>`
  .ant-upload {
    border: none !important;
  }
  .ant-upload-list {
    display: ${(props) => (props.$thumbnail ? "flex" : "block")};
    flex-wrap: wrap;
  }
`;

export const StyledUploadAvatar = styled.div`
  transition: opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  .ant-upload,
  .ant-upload-select {
    border: none !important;
  }
`;

export const StyledUploadBox = styled.div`
  .ant-upload {
    border: none !important;
  }
  .ant-upload-list {
    display: none;
  }
`;
