import React, { useRef, useState, useEffect } from 'react';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles'
import MUIRichTextEditor, { TMUIRichTextEditorRef } from 'mui-rte'
import { gatherBlocks } from '../utils/ConversionUtils';
import ProseNarrative from '../core/ProseNarrative';
import { EditorState } from 'draft-js';


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

  

const defaultControls = ["title", "bold", "italic", "underline", "strikethrough", "link", "media", 
  "quote", "code", "clear","save"];

const Story: React.FC = () => {
    const [lock, setLock] = useState(false);
    const [editorState, setEditorState] = useState(EditorState.createEmpty());

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
            let n = content.blocks.length;
            for(let i=0; i<n; i++) {
              // const narrative: ProseNarrative = new ProseNarrative()
            }
        // Use a library or a custom function to convert `content` to Markdown
    };
    return (
        <ThemeProvider theme={myTheme}>
            <EditorContainer>
                <MUIRichTextEditor label="Start typing..."
                    ref={ref}
                    readOnly={lock}
                    // customControls={[actSelect]}
                    controls={[...defaultControls, "select"]}
                    defaultValue={textval}
                    onSave={handleChange} 
                    onChange={setEditorState}
                />
            </EditorContainer>
        </ThemeProvider>
    );
};

export default Story;
