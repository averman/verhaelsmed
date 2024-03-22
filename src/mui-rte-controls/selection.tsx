import React from "react";
import {Lock} from '@mui/icons-material'
import { ContentBlock, EditorState } from "draft-js";
import { TCustomControl } from "mui-rte";

const actSelect: TCustomControl = {
    name: 'select',
    type: 'callback' as const,
    onClick: (editorState: EditorState) => {
      const selectionState = editorState.getSelection();
      const startKey = selectionState.getStartKey();
      const endKey = selectionState.getEndKey();
      const startOffset = selectionState.getStartOffset();
      const endOffset = selectionState.getEndOffset();
      const contentState = editorState.getCurrentContent();
  
      let selectedText = '';
      let block: ContentBlock | undefined = contentState.getBlockForKey(startKey);
  
      // If the selection starts and ends in the same block
      if (startKey === endKey) {
        selectedText = block.getText().slice(startOffset, endOffset);
      } else {
        // Selection spans multiple blocks
        let blockKey = startKey;
  
        while (block) {
          const blockText = block.getText();
          const key = block.getKey();
  
          if (key === startKey) {
            selectedText += blockText.slice(startOffset);
          } else if (key === endKey) {
            selectedText += '\n' + blockText.slice(0, endOffset);
            break; // No need to go further
          } else {
            selectedText += '\n' + blockText;
          }
  
          block = contentState.getBlockAfter(key);
        }
      }
  
      console.log(selectedText);
    },
    icon: <Lock />, // Use your actual icon component
  };