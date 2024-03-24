import React, { useRef, useState, useEffect } from 'react';
import { createTheme, styled, ThemeProvider } from '@mui/material/styles'
import MUIRichTextEditor, { TMUIRichTextEditorRef } from 'mui-rte'
import { gatherBlocks, spreadBlocks } from '../utils/ConversionUtils';
import ProseNarrative from '../core/ProseNarrative';
import { EditorState } from 'draft-js';
import { useNarrativeData } from '../contexts/NarrativeDataContext';


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
    const {narrativeData,setNarrativeData} = useNarrativeData();
    const [textval, setTextval] = useState<string>("");

    useEffect(() => {
        if(narrativeData["prose"]) {
            setTextval(gatherBlocks(
              Object.values(narrativeData["prose"])
              .sort((a, b) => a.timeline - b.timeline)
              .map(narrative => narrative.serialize('draftjs'))));
        }
    }, [narrativeData]);

    const ref = useRef<TMUIRichTextEditorRef>(null);
    const handleChange = (data: string) => {
        
            // Convert the editor's content to raw state
            const content = JSON.parse(data);
            let n = content.blocks.length;
            const blockRaw = spreadBlocks(data);
            const newNarratives= Object.assign({},narrativeData);
            newNarratives["prose"] = {};
            for(let i=0; i<n; i++) {
              const datum = blockRaw[i];
              console.log("datum", datum)
              const datumObj = JSON.parse(datum);
              const narrative: ProseNarrative = new ProseNarrative(datumObj.key, i, datumObj.text, datumObj.type);
              narrative.deserialize('draftjs', datum);
              console.log("after deserialize",narrative);
              newNarratives["prose"][datumObj.key] = narrative;
            }
            setNarrativeData(newNarratives);
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
