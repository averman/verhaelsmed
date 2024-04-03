import React, { useState } from 'react';
import { FieldProps } from '@rjsf/utils';
import { Button, TextField, Checkbox, FormControlLabel, Box } from '@mui/material';

// Assuming these are the tags you have defined in your schema
const availableTags = ["$", "$$", "$$$", "$$$$", "$$$$$", "censored", "<15B", "15B-80B", ">80B", "instruct", "roleplay", "chat", "mistral", "gpt", "llama2"];

const ConnectionsField = ({ formData, onChange }: FieldProps) => {
  const [editMode, setEditMode] = useState(false);
  const [localFormData, setLocalFormData] = useState(formData);

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const isCheckbox = event.target.type === 'checkbox';
    const value = name === "tags"
      ? isCheckbox
        ? event.target.checked ? [...localFormData.tags, event.target.value] : localFormData.tags.filter((tag: string) => tag !== event.target.value)
        : event.target.value
      : event.target.value;
    const updatedFormData = { ...localFormData, [name]: name == "maxTokenBudget"?Number.parseInt(value || 0): value };
    setLocalFormData(updatedFormData);
    onChange(updatedFormData);
  };

  const handleSave = () => {
    setEditMode(false);
    onChange(localFormData);
  };

  const renderTagCheckboxes = () => (
    availableTags.map(tag => (
      <FormControlLabel
        control={
          <Checkbox
            checked={localFormData.tags.includes(tag)}
            onChange={handleChange('tags')}
            value={tag}
          />
        }
        label={tag}
        key={tag}
      />
    ))
  );

  return (
    <Box>
      {editMode ? (
        <>
          <TextField
            label="Connection Name"
            value={localFormData.connectionId}
            onChange={handleChange('connectionId')}
            margin="normal"
            fullWidth
            name="connectionId"
          />
          <TextField
            label="Connection Host"
            value={localFormData.connectionHost}
            onChange={handleChange('connectionHost')}
            margin="normal"
            fullWidth
            name="connectionHost"
          />
          <TextField
            label="API Key"
            value={localFormData.connectionKey}
            onChange={handleChange('connectionKey')}
            margin="normal"
            fullWidth
            name="connectionKey"
          />
          <TextField
            label="Max Token Budget"
            type="number"
            value={localFormData.maxTokenBudget}
            onChange={handleChange('maxTokenBudget')}
            margin="normal"
            fullWidth
            name="maxTokenBudget"
          />
          <Box>
            <div>Tags:</div>
            {renderTagCheckboxes()}
          </Box>
          <Button onClick={handleSave} color="primary">Save</Button>
        </>
      ) : (
        <>
          <div style={{ fontSize: 'large' }}><strong>{localFormData.connectionId}</strong></div>
          <a style={{ fontSize: 'small' }}>Host: {localFormData.connectionHost}</a>
          <a style={{ fontSize: 'small' }}>Max Token Budget: {localFormData.maxTokenBudget}</a>
          <div style={{ fontSize: 'small' }}>Tags: {localFormData.tags.join(', ')}</div>
          <Button onClick={handleEdit} color="primary">Edit</Button>
        </>
      )}
    </Box>
  );
};

export default ConnectionsField;
