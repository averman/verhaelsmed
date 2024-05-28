// Filename: src/component/ProseEditor.tsx

import React, { useEffect, useRef, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { marked } from 'marked';
import { useNarrativeData } from '../contexts/NarrativeDataContext';
import ProseNarrative from '../core/ProseNarrative'
import Narrative from '../core/Narrative';
import { NarrativeItemsProps } from './SidebarFilter';
// Updated icon imports
import GroupIcon from '@mui/icons-material/Inventory'; // Placeholder for goToGroup
import UngroupIcon from '@mui/icons-material/Unarchive'; // Placeholder for goToGroupMember
import IconButton from '@mui/material/IconButton';
import Box from '@mui/material/Box';
// New icons for summary navigation
import SummarizeIcon from '@mui/icons-material/Compress'; // For navigating to a more summarized version
import DetailsIcon from '@mui/icons-material/Expand'; // For navigating to a more detailed version
import { Text } from './Deco';



const ProseEditor: React.FC<NarrativeItemsProps> = ({ narrativeId, switchEditing, initialEditingState,
    handleContextMenu, handleEditorSelect, isSelected }) => {
    const { narrativeData, setNarrativeData } = useNarrativeData();
    const [narrative, setNarrative] = useState<Narrative | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(initialEditingState);
    const [timeline, setTimeline] = useState<number | string | undefined>(undefined);
    const editableContentRef = useRef<HTMLDivElement>(null);

    const renderMarkdown = (markdown: string): { __html: string } => {
        const htmlString = marked(markdown, { async: false });
        if (htmlString instanceof Promise) throw "Do not enable async render"
        return { __html: htmlString };
    };

    const goToGroup = () => {
        let groupNarrative = narrativeData['prose'][narrative?.group || ''];
        Object.values(narrativeData['prose']).filter(n => n.isAGroup && n.hasTag('group', narrative?.group)).forEach(n => {
            n.groupVisibility = false;
        })
        groupNarrative.groupVisibility = true;
        setNarrativeData({ ...narrativeData })
    }

    const goToGroupMember = () => {
        let memberNarratives = Object.values(narrativeData['prose']).filter(n => n.group === narrative?.id);
        memberNarratives.forEach(n => {
            if (n.isAGroup) n.groupVisibility = true;
        })
        if (narrative && narrative.isAGroup) narrative.groupVisibility = false;
    };

    const handleIncreaseSummaryLevel = () => {
        narrative && narrative.summaryLevel++ && setNarrativeData({...narrativeData});
    };

    const handleDecreaseSummaryLevel = () => {
        narrative && narrative.summaryLevel-- && setNarrativeData({...narrativeData});
    };


    useEffect(() => {
        if (narrativeData && narrativeData["prose"]) {
            setNarrative(narrativeData["prose"][narrativeId])
            setTimeline(narrativeData["prose"][narrativeId].timeline)
        }
    }, [narrativeData])

    useEffect(() => {
        if (isEditing && editableContentRef.current) {
            editableContentRef.current.focus();
            // Optionally, place the cursor at the end of the content
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(editableContentRef.current);
            range.setStart(editableContentRef.current, 0)
            range.setEnd(editableContentRef.current, 0)
            range.collapse(false);
            if (sel == null) return;
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }, [isEditing]);

    const handleDoubleClick = () => {
        setIsEditing(true);
    };

    const handleBlur = () => {
        const newContent = editableContentRef.current?.innerText || '';
        if (newContent.trim() === '' && narrative?.summaryLevel === -1) {
            handleDelete()
        } else {
            handleEdit()
        }
        setIsEditing(false);
    };

    const handleEdit = () => {
        let newContent = editableContentRef.current?.innerText || '';
        if (newContent !== null && newContent !== narrativeData['prose'][narrativeId].getNormalizedText()) {
            const narratives = narrativeData['prose'];
            const narrative = narratives[narrativeId] as ProseNarrative;
            let tl: number | undefined = undefined;
            if (typeof timeline === 'string') { try { tl = parseFloat(timeline); } catch (e) { } }
            else if (typeof timeline === 'number') tl = timeline;
            narrative.timeline = tl || narrative.timeline;
            narrative.setNormalizedText(newContent);
            setNarrativeData({ ...narrativeData, 'prose': { ...narratives, [narrativeId]: narrative } });
        }
    };

    // Delete functionality
    const handleDelete = () => {
        const { [narrativeId]: deleted, ...remainingNarratives } = narrativeData['prose'];
        setNarrativeData({ ...narrativeData, 'prose': remainingNarratives });
    };

    const handleSplit = () => {
        let newContent = editableContentRef.current?.innerText || '';
        console.log(JSON.stringify(newContent))
        if (newContent !== null && newContent !== narrativeData['prose'][narrativeId].getNormalizedText()
            && newContent.indexOf('\n\n\n\n\n') > -1) {
            handleEdit();
            switchEditing(narrative?.id || '', true);
            setIsEditing(false);
        }
    }
    let ct: string;
    if (typeof timeline === 'string') ct = timeline;
    else if (typeof timeline === 'number') ct = timeline.toString();
    else ct = '0';

    return (
        <Card onDoubleClick={handleDoubleClick} sx={{margin: 2, marginBottom: 3}} onClick={(e) => {
            if (e.ctrlKey || e.metaKey) { // Check for Ctrl or Cmd key
                e.stopPropagation(); // Prevent event from reaching the document
                handleEditorSelect(narrativeId);
            }
        }}>
            <Box display="flex" flexDirection="column" position="relative">
                <Box position="absolute" top={0} right={0} zIndex="tooltip">
                    {narrative?.group && (
                        <IconButton onClick={goToGroup} size="small">
                            <GroupIcon fontSize="inherit" />
                        </IconButton>
                    )}
                    {narrative?.isAGroup && (
                        <IconButton onClick={goToGroupMember} size="small">
                            <UngroupIcon fontSize="inherit" />
                        </IconButton>
                    )}
                    {narrative && narrative.summaryLevel > -1 && (
                        <IconButton onClick={handleDecreaseSummaryLevel} size="small">
                            <DetailsIcon fontSize="inherit" />
                        </IconButton>
                    )}
                    {narrative?.haveSummary() && (
                        <IconButton onClick={handleIncreaseSummaryLevel} size="small">
                            <SummarizeIcon fontSize="inherit" />
                        </IconButton>
                    )}
                </Box>
                <Box position="absolute" top={0} left={0} zIndex="tooltip">
                    <Text label='' value={ct} onChange={(e)=>setTimeline(e.target.value)} 
                        InputProps={{sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            }, 
                            '& .MuiInputBase-input': {
                                padding: 0,
                                margin: 0,
                                marginLeft: 2,
                                top: -2
                            },
                            top: -10,
                            fontSize: 12
                        } }}
                    />
                </Box>
                <CardContent>
                    {isEditing ? (
                        <div
                            ref={editableContentRef} // Use the ref here
                            contentEditable
                            onBlur={handleBlur}
                            onInput={handleSplit}
                            onContextMenu={e => handleContextMenu(e, ["test", "tags"], narrativeId)}
                            dangerouslySetInnerHTML={{ __html: narrative?.getNormalizedText() || '' }}
                            style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}
                        ></div>
                    ) : (
                        <Typography component="div">
                            <div dangerouslySetInnerHTML={renderMarkdown(narrative?.getNormalizedText() || '')}
                                style={{ whiteSpace: 'pre-wrap', textAlign: 'left' }}
                                onContextMenu={e => {
                                    const contextMenus = ["tags", "delete"];
                                    if (isSelected && (narrative?.group === "")) contextMenus.push("group");
                                    if (!isSelected && narrative?.isAGroup) contextMenus.push("ungroup");
                                    if (!isSelected && narrative?.group !== "") contextMenus.push("remove from group");
                                    if (!isSelected) contextMenus.push("create summary");
                                    if (!isSelected) contextMenus.push("generate text");
                                    handleContextMenu(e, contextMenus, narrativeId)
                                }}></div>
                        </Typography>
                    )}
                </CardContent>
            </Box>
        </Card>
    );
};

export default ProseEditor;
