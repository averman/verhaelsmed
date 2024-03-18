import React, { useRef, useState, useEffect } from 'react';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles'
import MUIRichTextEditor, { TCustomControl, TMUIRichTextEditorRef } from 'mui-rte'
import {Lock} from '@mui/icons-material'
import { ContentBlock, EditorState } from 'draft-js';
import IconButton from '@mui/material/IconButton';
import { gatherBlocks } from '../utils/ConversionUtils';
import ProseNarrative from '../core/ProseNarrative';


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

const defaultControls = ["title", "bold", "italic", "underline", "strikethrough", "link", "media", 
  "quote", "code", "clear","save"];

const Story: React.FC = () => {
    const [lock, setLock] = useState(false);

    const defText:ProseNarrative = new ProseNarrative("1", 0, 
      "*italic*\n**bold**\n~~strikethrough~~\n[link](https://www.google.com)");
    const defText2:ProseNarrative = new ProseNarrative("2", 0, "header");
    defText2.blockType = "header-one";
    const defText3:ProseNarrative = new ProseNarrative("3", 0, "code");
    defText3.blockType = "code-block";
    const defText4:ProseNarrative = new ProseNarrative("4", 0, "quote");
    defText4.blockType = "blockquote";
    const [textval, setTextval] = useState(gatherBlocks([
      defText.serialize("draftjs"),
      defText2.serialize("draftjs"),
      defText3.serialize("draftjs"),
      defText4.serialize("draftjs")
    ]));
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
