import { useNarrativeData } from "../contexts/NarrativeDataContext";
import LoreNarrative from "../core/LoreNarrative";
import { BorderedBox, TextArea } from "./Deco";
import ObjectArray from "./ObjectArray";
import { NarrativeItemsProps } from "./SidebarFilter";
import {Text} from "./Deco"
import LoreTypes from "../hardcoded-settings/LoreTypes";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { NarrativeDict } from "../core/Narrative";

const LoreEditor: React.FC<NarrativeItemsProps> = ({ narrativeId, switchEditing, initialEditingState,
    handleContextMenu, handleEditorSelect, isSelected }) => {

        const { narrativeData, setNarrativeData } = useNarrativeData();
        // const loreNarrative:LoreNarrative = narrativeData["lore"][narrativeId] as LoreNarrative;
        const [loreNarrative, setLoreNarrative] = useState<LoreNarrative | undefined>(undefined);
        const [loreTimeline, setLoreTimeline] = useState<number | string | undefined>(undefined);

        useEffect(() => {
            if (narrativeData && narrativeData["lore"]) {
                let narrative = narrativeData["lore"][narrativeId];
                setLoreNarrative(narrative as LoreNarrative);
                if(narrative) setLoreTimeline(narrative.timeline);
            }
        }, [narrativeData]);

        const renderKeyComponent = (item: string[], handleChange: (item:string[])=> void) => {
            return <BorderedBox collapsible 
                title={`${item[0]}: ${item[1].length>150?`${item[1].slice(0,120)}...`:item[1]}`} 
                sx={{width: '100%', padding: 0, margin: 0}}
            >
                <Text label="" value={item[0]} onChange={(e)=>[handleChange([e.target.value, item[1]])]} 
                    InputProps={{
                        sx: {
                            '& .MuiOutlinedInput-notchedOutline': {
                                border: 'none',
                            }, 
                            '& .MuiInputBase-input': {
                                padding: 0,
                                margin: 0,
                                marginLeft: 2
                            },
                        }
                    }}
                />
                { item[1].length > 150 || item[1].split('\n').length > 1 ? (
                    <TextArea label={`${item[0]} value`} 
                        value={item[1]} 
                        onChange={(e)=>[handleChange([item[0], e.target.value])]} 
                        sx= {{width: '97%'} }
                    />

                ): (
                    <Text label={`${item[0]} value`} 
                        value={item[1]} onChange={(e)=>[handleChange([item[0], e.target.value])]} 
                        InputProps={{sx: {width: '97%'} }}
                    />
                )}
            </BorderedBox>
        }

        function handleObjectChange(event: {
            target: {
                name: string;
                value: any[];
            };
        }): void {
            if(!loreNarrative) return;
            loreNarrative.items = {};
            for(let pair of event.target.value){
                loreNarrative.items[pair[0]] = pair[1];
            }
            if(loreNarrative.loreType in LoreTypes && LoreTypes[loreNarrative.loreType].idFrom)
                loreNarrative.loreId = loreNarrative.items[LoreTypes[loreNarrative.loreType].idFrom || loreNarrative.loreId];
        }

        if(loreNarrative){
            let title = loreNarrative.loreId;
            if(loreNarrative.loreType in LoreTypes && LoreTypes[loreNarrative.loreType].idFrom)
                title = loreNarrative.items[LoreTypes[loreNarrative.loreType].idFrom || title];
            return <BorderedBox collapsible 
                title={`[${loreNarrative.loreType}] ${title}  @[${loreNarrative.timeline}]`} 
                onContextMenu={e => handleContextMenu(e, [ "new snapshot", "delete" ], narrativeId)} 
            >
                <div >
                    {/* {loreNarrative.getNormalizedText()} */}
                    <Text label="Timeline" value={loreTimeline?.toString() || '0'} 
                        onChange={(e)=> setLoreTimeline(e.target.value)} />
                    <ObjectArray<string[]>
                        itemRenderer={renderKeyComponent}
                        newItemDefaultValue={["key", "value"]}
                        onChange={handleObjectChange}
                        value={Object.keys(loreNarrative.items).map(k=>[k,loreNarrative.items[k]])}
                    >
                    </ObjectArray>
                    <Button color="primary" onClick={()=>{ 
                        let newTimeline:number|undefined = undefined;
                        if(typeof loreTimeline === 'string') { try{newTimeline = parseFloat(loreTimeline);}catch(e){} }
                        else if (typeof loreTimeline === 'number') newTimeline = loreTimeline;
                        loreNarrative.timeline = newTimeline || loreNarrative.timeline;
                        if(newTimeline == 0) loreNarrative.timeline = 0;
                        setNarrativeData({...narrativeData}); 
                    }}>Save</Button>
                </div>
            </BorderedBox>;
        }

        return null;
    };

export default LoreEditor;