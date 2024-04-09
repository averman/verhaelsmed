import React from 'react';
import { Button, TextField, Checkbox, FormControlLabel, Box } from '@mui/material';
import AbstractRJSFCustomField from './AbstractRJSFCustomField'
import { FieldProps } from '@rjsf/utils';

// Assuming these are the tags you have defined in your schema
export const connectionsTags = ["$", "$$", "$$$", "$$$$", "$$$$$", "censored", "<15B", "15B-80B", ">80B", "instruct", "roleplay", "chat", "mistral", "gpt", "llama2"];

class ConnectionsFieldClass extends AbstractRJSFCustomField<{ [key: string]: any }> {
    renderTagCheckboxes() {
        const { localFormData } = this.state;
        return connectionsTags.map(tag => (
            <FormControlLabel
                control={
                    <Checkbox
                        checked={Array.isArray(localFormData.tags)?localFormData.tags.includes(tag):false}
                        onChange={this.handleChange('tags')}
                        value={tag}
                    />
                }
                label={tag}
                key={tag}
            />
        ));
    }

    readOnly() {
        const { localFormData } = this.state;
        return (
            <>
                <div style={{ fontSize: 'large' }}><strong>{localFormData.connectionId}</strong></div>
                <a style={{ fontSize: 'small' }}>Host: {localFormData.connectionHost}</a>
                <a style={{ fontSize: 'small' }}>Max Token Budget: {localFormData.maxTokenBudget}</a>
                <div style={{ fontSize: 'small' }}>Tags: {Array.isArray(localFormData.tags)?localFormData.tags.join(', '):''}</div>
                <Button onClick={this.handleEdit} color="primary">Edit</Button>
            </>
        );
    }

    editing() {
        return (
            <>
                <TextField label="Connection Name" value={this.state.localFormData.connectionId} onChange={this.handleChange('connectionId')} margin="normal" fullWidth name="connectionId" />
                <TextField label="Connection Host" value={this.state.localFormData.connectionHost} onChange={this.handleChange('connectionHost')} margin="normal" fullWidth name="connectionHost" />
                <TextField label="API Key" value={this.state.localFormData.connectionKey} onChange={this.handleChange('connectionKey')} margin="normal" fullWidth name="connectionKey" />
                <TextField label="Model" value={this.state.localFormData.model} onChange={this.handleChange('model')} margin="normal" fullWidth name="model" />
                <TextField label="Max Token Budget" type="number" value={this.state.localFormData.maxTokenBudget} onChange={this.handleChange('maxTokenBudget',true)} margin="normal" fullWidth name="maxTokenBudget" />
                <Box>{<div>Tags:</div>}{this.renderTagCheckboxes()}</Box>
                <Button onClick={this.handleSave} color="primary">Save</Button>
            </>
        );
    }
}

const ConnectionsField: React.FC<FieldProps> = (props) => {
    return <ConnectionsFieldClass {...props} formData={props.formData || {}} />;
};

export default ConnectionsField;