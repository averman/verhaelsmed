import React from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Box, TextareaAutosize, Typography } from '@mui/material';
import AbstractRJSFCustomField from './AbstractRJSFCustomField'
import { FieldProps } from '@rjsf/utils';
import TextFieldArray from '../TextFieldArray'
import CheckboxArray from '../CheckboxArray'
import { connectionsTags } from './ConnectionsField';
import ShallowObjectArray from '../ShallowObjectArray'
import {BorderedBox, Text, Dropdown, TextArea} from '../Deco'

const agentTypes = ["summarize"];
const operationTypes = ["none","agent", "script", "internal-functions"]
const sortBy = ["price-asc", "price-desc", "context-asc", "context-desc", "parameter-size-asc", "parameter-size-desc"]

class AgentFieldClass extends AbstractRJSFCustomField<{ [key: string]: any }> {
    readOnly() {
        const { localFormData } = this.state;
        return (
            <>
                <div style={{ fontSize: 'large' }}>
                    <strong>{localFormData.agentType || "undefined"} Agent: {localFormData.agentName || "unnamed"}</strong>
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
                <Dropdown
                    label="Agent Type"
                    value={this.state.localFormData.agentType}
                    options={agentTypes}
                    onChange={this.handleChange('agentType')}
                />
                <TextArea
                    label="Description"
                    value={this.state.localFormData.description}
                    onChange={this.handleChange('description')}
                />  
                <BorderedBox title="Connection Criteria" collapsible={true}>
                    <TextFieldArray
                        title='Sort By'
                        value={this.state.localFormData.connectionCriteria?.sortBy || []}
                        onChange={this.handleChange('connectionCriteria.sortBy') as unknown as (event: { target: { name: string; value: any[]; }; }) => void}
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
                        value={this.state.localFormData.connectionCriteria?.mandatoryTag || []}
                        onChange={this.handleChange('connectionCriteria.mandatoryTag') as unknown as (event: { target: {value: any[]; }; }) => void}
                    >
                    </CheckboxArray>
                    <CheckboxArray
                        title='Exclude Tag'
                        options={connectionsTags}
                        value={this.state.localFormData.connectionCriteria?.negativeMandatoryTag || []}
                        onChange={this.handleChange('connectionCriteria.negativeMandatoryTag') as unknown as (event: { target: { value: any[]; }; }) => void}
                    >
                    </CheckboxArray>
                </BorderedBox>
                <BorderedBox title='inputs' collapsible>

                    <ShallowObjectArray
                        value={this.state.localFormData.inputs || []}
                        fields={[{name: 'key', label: 'input key'}, {name: 'value'}]}
                        onChange={this.handleChange('inputs') as unknown as (event: { target: { value: any[]; }; }) => void}
                    />
                </BorderedBox>
                <BorderedBox title="Main Prompt" collapsible={true}>
                    <TextArea
                        label="System Context"
                        value={this.state.localFormData.mainPrompt?.systemContext || ''}
                        onChange={this.handleChange('mainPrompt.systemContext')}
                    />
                    <TextArea
                        label="Instruction"
                        value={this.state.localFormData.mainPrompt?.instruction || ''}
                        onChange={this.handleChange('mainPrompt.instruction')}
                    />
                </BorderedBox>
                <BorderedBox title="Parser" collapsible={true}>
                    <Dropdown
                        label="Type"
                        value={this.state.localFormData.parser?.type || 'none'}
                        onChange={this.handleChange('parser.type')}
                        options={operationTypes}
                    />
                    <TextArea
                        label="System Context"
                        value={this.state.localFormData.parser?.systemContext || ''}
                        onChange={this.handleChange('parser.systemContext')}
                    />
                    <TextArea
                        label="Instruction"
                        value={this.state.localFormData.parser?.instruction || ''}
                        onChange={this.handleChange('parser.instruction')}
                    />
                </BorderedBox>
                <BorderedBox title="Validator" collapsible={true}>
                    <Dropdown
                        label="Type"
                        value={this.state.localFormData.validator?.type || 'none'}
                        onChange={this.handleChange('validator.type')}
                        options={operationTypes}
                    />
                    <TextArea
                        label="System Context"
                        value={this.state.localFormData.validator?.systemContext || ''}
                        onChange={this.handleChange('validator.systemContext')}
                    />
                    <TextArea
                        label="Instruction"
                        value={this.state.localFormData.validator?.instruction || ''}
                        onChange={this.handleChange('validator.instruction')}
                    />
                </BorderedBox>
                <BorderedBox title="Decider" collapsible={true}>
                    <Dropdown
                        label="Type"
                        value={this.state.localFormData.decider?.type || 'none'}
                        onChange={this.handleChange('decider.type')}
                        options={operationTypes}
                    />
                    <TextArea
                        label="System Context"
                        value={this.state.localFormData.decider?.systemContext || ''}
                        onChange={this.handleChange('decider.systemContext')}
                    />
                    <TextArea
                        label="Instruction"
                        value={this.state.localFormData.decider?.instruction || ''}
                        onChange={this.handleChange('decider.instruction')}
                    />
                    <ShallowObjectArray
                        value={this.state.localFormData.decider?.targets || ''}
                        onChange={this.handleChange('decider.targets') as unknown as (event: { target: { name: string; value: any[]; }; }) => void}
                        fields={[{name: "description"}, {name: "targetName"}]}
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
