import React from 'react';
import { Box } from '@mui/material';
import { FieldProps } from '@rjsf/utils';

type LocalFormData = {
    [key: string]: any;
  };
  

export default abstract class AbstractRJSFCustomField<T extends LocalFormData> extends React.Component<FieldProps<T> & { formData: T }, { editMode: boolean, localFormData: T }> {
    constructor(props: FieldProps<T> & { formData: T }) {
        super(props);
        this.state = {
            editMode: false,
            localFormData: this.props.formData
        };
    }

    handleEdit = () => {
        this.setState({ editMode: true });
    };

    handleChange = (name: string, isNumber: boolean = false) => (event: React.ChangeEvent<HTMLInputElement>) => {
        if(!event.target) return;
        const { localFormData } = this.state;
        const isCheckbox = event.target.type === 'checkbox';
        let value: any = event.target.value;
    
        // Handle checkbox values
        if (isCheckbox) {
            let currentCheckboxes = this.getValueByPath(localFormData, name) || [];
            if(event.target.checked){
                currentCheckboxes.push(event.target.value)
            } else {
                currentCheckboxes = currentCheckboxes.filter((item: any) => item !== event.target.value)
            }
            value = [...currentCheckboxes]
        } else if (isNumber) {
            // Handle maxTokenBudget specific logic
            value = Number.parseInt(value || '0', 10);
        }
    
        // Use a function to update the nested value
        const updatedFormData = this.setValueByPath({ ...localFormData }, name, value);
    
        this.setState({ localFormData: updatedFormData });
        this.props.onChange(updatedFormData);
    };
    
    // Function to get a value by path
    getValueByPath = (object: any, path: string) => {
        const keys = path.split('.');
        let result = object;
        for (const key of keys) {
            if (result[key] === undefined) return undefined; // Return undefined if the path is not found
            result = result[key];
        }
        return result;
    };
    
    // Function to set a value by path
    setValueByPath = (object: any, path: string, value: any) => {
        const keys = path.split('.');
        let current = object;
    
        // Iterate through the keys to the second to last, creating objects if necessary
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (current[key] === undefined) {
                current[key] = {};
            }
            current = current[key];
        }
    
        // Set the value to the last key
        current[keys[keys.length - 1]] = value;
        return object;
    };
    

    handleSave = () => {
        this.setState({ editMode: false });
        this.props.onChange(this.state.localFormData);
    };

    abstract readOnly(): JSX.Element;
    abstract editing(): JSX.Element;

    render() {
        return (
            <Box>
                {this.state.editMode ? this.editing() : this.readOnly()}
            </Box>
        );
    }
}
