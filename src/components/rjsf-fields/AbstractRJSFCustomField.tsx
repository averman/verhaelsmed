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

    handleChange = (name: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
        const { localFormData } = this.state;
        const isCheckbox = event.target.type === 'checkbox';
        let value:any = event.target.value;

        if (isCheckbox) {
            value = event.target.checked ? [...localFormData[name], event.target.value] : localFormData[name].filter((item: any) => item !== event.target.value);
        } else if (name === "maxTokenBudget") {
            value = Number.parseInt(value || '0', 10);
        }

        const updatedFormData = { ...localFormData, [name]: value };
        this.setState({ localFormData: updatedFormData });
        this.props.onChange(updatedFormData);
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
