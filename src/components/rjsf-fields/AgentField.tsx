import React from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Box, TextareaAutosize, Typography } from '@mui/material';
import AbstractRJSFCustomField from './AbstractRJSFCustomField'
import { FieldProps } from '@rjsf/utils';
import TextFieldArray from '../TextFieldArray'
import CheckboxArray from '../CheckboxArray'
import { connectionsTags } from './ConnectionsField';
import ShallowObjectArray from '../ShallowObjectArray'
import {BorderedBox} from '../Deco'

const agentTypes = ["summarize"];
const operationTypes = ["none","agent", "script", "internal-functions"]

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
                <TextField
                    label="Agent Name"
                    value={this.state.localFormData.agentName}
                    onChange={this.handleChange('agentName')}
                    margin="normal"
                    fullWidth
                    name="agentName"
                />
                <TextField
                    label="Agent Type"
                    value={this.state.localFormData.agentType}
                    onChange={this.handleChange('agentType')}
                    margin="normal"
                    fullWidth
                    name="agentType"
                    select
                    SelectProps={{ native: true }}
                >
                    <option value=""></option>
                    {agentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </TextField>
                <TextField
                    label="Description"
                    value={this.state.localFormData.description}
                    onChange={this.handleChange('description')}
                    margin="normal"
                    fullWidth
                    multiline
                    rows={4}
                    name="description"
                />  
                <BorderedBox title="Connection Criteria" collapsible={true}>
                    <TextFieldArray
                        title='Sort By'
                        value={this.state.localFormData.connectionCriteria?.sortBy || []}
                        onChange={this.handleChange('connectionCriteria.sortBy') as unknown as (event: { target: { name: string; value: any[]; }; }) => void}
                    >
                        <TextField
                            label="Sort By"
                            margin="normal"
                            fullWidth
                            name="sortBy"
                            select
                            SelectProps={{native: true}}>
                            <option value=""></option>
                            {["price-asc","price-desc","context-asc","context-desc","parameter-asc","parameter-desc"].map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </TextField>
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
                    <TextField
                        multiline
                        label="System Context"
                        value={this.state.localFormData.mainPrompt?.systemContext || ''}
                        onChange={this.handleChange('mainPrompt.systemContext')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="systemContext"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                    <TextField
                        multiline
                        label="Instruction"
                        value={this.state.localFormData.mainPrompt?.instruction || ''}
                        onChange={this.handleChange('mainPrompt.instruction')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="instruction"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                </BorderedBox>
                <BorderedBox title="Parser" collapsible={true}>
                    <TextField
                        multiline
                        label="Type"
                        value={this.state.localFormData.parser?.type || 'none'}
                        onChange={this.handleChange('parser.type')}
                        margin="normal"
                        fullWidth
                        select
                        SelectProps={{native: true}}
                    >
                        <option value=""></option>
                        {operationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </TextField>
                    <TextField
                        multiline
                        label="System Context"
                        value={this.state.localFormData.parser?.systemContext || ''}
                        onChange={this.handleChange('parser.systemContext')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="systemContext"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                    <TextField
                        multiline
                        label="Instruction"
                        value={this.state.localFormData.parser?.instruction || ''}
                        onChange={this.handleChange('parser.instruction')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="instruction"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                </BorderedBox>
                <BorderedBox title="Validator" collapsible={true}>
                    <TextField
                        multiline
                        label="Type"
                        value={this.state.localFormData.validator?.type || 'none'}
                        onChange={this.handleChange('validator.type')}
                        margin="normal"
                        fullWidth
                        select
                        SelectProps={{native: true}}
                    >
                        <option value=""></option>
                        {operationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </TextField>
                    <TextField
                        multiline
                        label="System Context"
                        value={this.state.localFormData.validator?.systemContext || ''}
                        onChange={this.handleChange('validator.systemContext')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="systemContext"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                    <TextField
                        multiline
                        label="Instruction"
                        value={this.state.localFormData.validator?.instruction || ''}
                        onChange={this.handleChange('validator.instruction')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="instruction"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                </BorderedBox>
                <BorderedBox title="Decider" collapsible={true}>
                    <TextField
                        multiline
                        label="Type"
                        value={this.state.localFormData.decider?.type || 'none'}
                        onChange={this.handleChange('decider.type')}
                        margin="normal"
                        fullWidth
                        select
                        SelectProps={{native: true}}
                    >
                        <option value=""></option>
                        {operationTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </TextField>
                    <TextField
                        multiline
                        label="System Context"
                        value={this.state.localFormData.decider?.systemContext || ''}
                        onChange={this.handleChange('decider.systemContext')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="systemContext"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                    <TextField
                        multiline
                        label="Instruction"
                        value={this.state.localFormData.decider?.instruction || ''}
                        onChange={this.handleChange('decider.instruction')}
                        margin="normal"
                        fullWidth
                        minRows={4}
                        name="instruction"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                              overflow: 'auto' // Ensures the content fits within the resizable area
                            }
                          }}
                    />
                    <ShallowObjectArray
                        value={this.state.localFormData.decider?.targets || ''}
                        onChange={this.handleChange('decider.targets') as unknown as (event: { target: { name: string; value: any[]; }; }) => void}
                        fields={[{name: "description"}, {name: "targetName"}]}
                    />
                </BorderedBox>
                <BorderedBox title='retry | timeout | output' collapsible>
                    <TextField
                        label="Max Retry Count"
                        value={this.state.localFormData.maxRetryCount || 0}
                        onChange={this.handleChange('maxRetryCount', true)} // Assuming true converts string to number
                        margin="normal"
                        fullWidth
                        type="number"
                        name="maxRetryCount"
                    />
                    <TextField
                        label="Timeout"
                        value={this.state.localFormData.timeout || 60}
                        onChange={this.handleChange('timeout', true)} // Assuming true converts string to number
                        margin="normal"
                        fullWidth
                        type="number"
                        name="timeout"
                    />
                    <TextField
                        label="Output"
                        value={this.state.localFormData.saveAs}
                        onChange={this.handleChange('saveAs')}
                        margin="normal"
                        fullWidth
                        name="saveAs"
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
