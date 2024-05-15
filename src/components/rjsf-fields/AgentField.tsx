import React from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Box, TextareaAutosize, Typography } from '@mui/material';
import AbstractRJSFCustomField from './AbstractRJSFCustomField'
import { FieldProps } from '@rjsf/utils';
import TextFieldArray from '../TextFieldArray'
import CheckboxArray from '../CheckboxArray'
import { connectionsTags } from './ConnectionsField';
import ShallowObjectArray from '../ShallowObjectArray'
import ObjectArray from '../ObjectArray'
import AgentAction from './AgentAction'
import {BorderedBox, Text, Dropdown, TextArea} from '../Deco'

const agentTypes = ["", "summarize"];
const operationTypes = ["none","agent", "script", "internal-functions"]
const sortBy = ["price-asc", "price-desc", "context-asc", "context-desc", "parameter-size-asc", "parameter-size-desc"]

class AgentFieldClass extends AbstractRJSFCustomField<{ [key: string]: any }> {
    readOnly() {
        const { localFormData } = this.state;
        return (
            <>
                <div style={{ fontSize: 'large' }}>
                    <strong>{localFormData.agentType || agentTypes[0]} Agent: {localFormData.agentName || "unnamed"}</strong>
                </div>
                <Button onClick={this.handleEdit} color="primary">Edit</Button>
            </>
        );
    }

    editing() {
        return (
            <>
                <Text
                    label="Agent Name"
                    value={this.state.localFormData.agentName}
                    onChange={this.handleChange('agentName')}
                />
                <Text
                    label="Agent Type"
                    value={this.state.localFormData.agentType}
                    onChange={this.handleChange('agentType')}
                />
                <TextArea
                    label="Description"
                    value={this.state.localFormData.description}
                    onChange={this.handleChange('description')}
                />  
                <ObjectArray 
                    title="Agent Actions"
                    value={this.state.localFormData.agentActions || []}
                    onChange={this.handleChange('agentActions') as unknown as (event: { target: { name: string; value: any[]; }; }) => void}
                    itemRenderer={(item: any, handleChange: (item:any)=> void) => {
                        return <AgentAction
                            item={item}
                            onChange={handleChange}
                        />
                    }}
                    newItemDefaultValue={{
                        name: '',
                        type: 'prompt',
                        connectionCriteria: {
                            sortBy: [],
                            mandatoryTag: [],
                            negativeMandatoryTag: []
                        },
                        parameters: [],
                        targets: []
                    }}
                />
                <BorderedBox title='inputs' collapsible>

                    <ShallowObjectArray
                        value={this.state.localFormData.inputs || []}
                        fields={[{name: 'key', label: 'input key'}, {name: 'value'}]}
                        onChange={this.handleChange('inputs') as unknown as (event: { target: { value: any[]; }; }) => void}
                    />
                </BorderedBox>
                <BorderedBox title='retry | timeout | output' collapsible>
                    <Text
                        label="Max Retry Count"
                        value={this.state.localFormData.maxRetryCount || 0}
                        onChange={this.handleChange('maxRetryCount', true)} 
                    />
                    <Text
                        label="Timeout"
                        value={this.state.localFormData.timeout || 60}
                        onChange={this.handleChange('timeout', true)}
                    />
                    <Text
                        label="Output"
                        value={this.state.localFormData.saveAs}
                        onChange={this.handleChange('saveAs')}
                    />
                </BorderedBox>
                <Button onClick={this.handleSave} color="primary">Save</Button>
            </>
        );
    }
}

const AgentField: React.FC<FieldProps> = (props) => {
    return <AgentFieldClass {...props} formData={props.formData || {}} />;
};

export default AgentField;
