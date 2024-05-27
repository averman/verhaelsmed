import React from 'react';
import { BorderedBox, Text, Dropdown, TextArea } from '../Deco'
import TextFieldArray from '../TextFieldArray';
import CheckboxArray from '../CheckboxArray';
import { connect } from 'http2';
import { connectionsTags } from './ConnectionsField';
import ShallowObjectArray from '../ShallowObjectArray';
import { Box } from '@mui/material';

interface AgentActionProps {
    item: any;
    onChange: (item: any) => void;
}

const sortBy = ["price-asc", "price-desc", "context-asc", "context-desc", "parameter-size-asc", "parameter-size-desc"]

const AgentAction: React.FC<AgentActionProps> = ({ onChange, item }) => {
    return (<BorderedBox collapsible title={item.name} sx={{width: "100%"}}>
        <Box sx={{width: '99%'}}>
            <Text
                label="Action Name"
                value={item.name}
                onChange={(e) => onChange({ ...item, name: e.target.value })}
            />
            <Dropdown
                label="Action Type"
                value={item.type}
                options={['prompt', 'script', 'nativeAction']}
                onChange={(e) => onChange({ ...item, type: e.target.value })}
            />
            {item.type === 'prompt' && (<BorderedBox collapsible title='Prompt Properties'>
                <BorderedBox title="Connection Criteria" collapsible={true}>
                    <TextFieldArray
                        title='Sort By'
                        value={item.connectionCriteria.sortBy}
                        onChange={(e) => onChange({ ...item, connectionCriteria: { ...item.connectionCriteria, sortBy: e.target.value } })}
                    >
                        <Dropdown
                            label="Sort By"
                            onChange={null as any}
                            value=''
                            options={sortBy}
                        />
                    </TextFieldArray>
                    <CheckboxArray
                        title='Mandatory Tag'
                        options={connectionsTags}
                        value={item.connectionCriteria.mandatoryTag}
                        onChange={(e) => onChange({ ...item, connectionCriteria: { ...item.connectionCriteria, mandatoryTag: e.target.value } })}
                    >
                    </CheckboxArray>
                    <CheckboxArray
                        title='Exclude Tag'
                        options={connectionsTags}
                        value={item.connectionCriteria.negativeMandatoryTag}
                        onChange={(e) => onChange({ ...item, connectionCriteria: { ...item.connectionCriteria, negativeMandatoryTag: e.target.value } })}
                    >
                    </CheckboxArray>
                </BorderedBox>

                <TextArea
                    label="System Context"
                    value={item.systemContext}
                    minRows={7}
                    onChange={(e) => onChange({ ...item, systemContext: e.target.value })}
                />
                <TextArea
                    label="Instruction"
                    value={item.instruction}
                    minRows={7}
                    onChange={(e) => onChange({ ...item, instruction: e.target.value })}
                />
            </BorderedBox>)}

            {item.type === 'script' && (<>
                <TextArea
                    label="Script"
                    minRows={15}
                    value={item.script}
                    onChange={(e) => onChange({ ...item, script: e.target.value })}
                />
            </>)}

            {item.type === 'nativeAction' && (<>
                <Text
                    label="Native Action"
                    value={item.nativeAction}
                    onChange={(e) => onChange({ ...item, nativeAction: e.target.value })}
                />
                <ShallowObjectArray
                    title="Parameters"
                    value={item.parameters}
                    fields={[{ name: 'parameter', type: 'string' }]}
                    onChange={(e) => onChange({ ...item, parameters: e.target.value })}
                />
            </>)}
            <Text
                label="Max Evoked Count"
                value={item.maxEvokedCount}
                onChange={(e) => onChange({ ...item, maxEvokedCount: e.target.value })}
                
            />
            <Text
                label="Save As"
                value={item.saveAs}
                onChange={(e) => onChange({ ...item, saveAs: e.target.value })}
            />
            <ShallowObjectArray
                title="Targets"
                value={item.targets}
                fields={[{ name: 'description', type: 'string' }, { name: 'targetName', type: 'string' }]}
                onChange={(e) => onChange({ ...item, targets: e.target.value })}
            />
        </Box>
    </BorderedBox>)
}

export default AgentAction;