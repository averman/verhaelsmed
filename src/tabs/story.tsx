import React, { useRef, useState } from 'react';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles'
import MUIRichTextEditor, { TCustomControl, TMUIRichTextEditorRef } from 'mui-rte'
import {Lock} from '@mui/icons-material'
import { ContentBlock, EditorState } from 'draft-js';
import IconButton from '@mui/material/IconButton';


const myTheme = createTheme({
    // Set up your custom MUI theme here
})


const EditorContainer = styled('div')(({ theme }) => ({
    '#mui-rte-toolbar': {
      position: 'sticky',
      top: 30,
      zIndex: 1000,
      backgroundColor: theme.palette.background.paper,
    },
  }));

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

const defaultControls = ["title", "bold", "italic", "underline", "strikethrough", "link", "media", "numberList", "bulletList", "quote", "code", "clear"];

const Story: React.FC = () => {
    const [lock, setLock] = useState(false);
    const [textval, setTextval] = useState("");
    const ref = useRef<TMUIRichTextEditorRef>(null);
    const handleChange = (data: string) => {
        
            // Convert the editor's content to raw state
            setTextval(data);
            const content = JSON.parse(data);
            console.log(content);
        // Use a library or a custom function to convert `content` to Markdown
    };
    return (
        <ThemeProvider theme={myTheme}>
            <EditorContainer>
                <MUIRichTextEditor label="Start typing..."
                    ref={ref}
                    readOnly={lock}
                    customControls={[actSelect]}
                    controls={[...defaultControls, "select"]}
                    defaultValue={textval}
                    onSave={handleChange} 
                />
            </EditorContainer>
        </ThemeProvider>
    );
};

export default Story;