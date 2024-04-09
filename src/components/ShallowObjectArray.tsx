import React, { useState, useEffect, ReactElement, useCallback, ChangeEvent } from 'react';
import { Button, Box, Typography, IconButton, TextField } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import {BorderedBox, Text, TextArea} from "./Deco"
import { JsxElement } from 'typescript';

interface ShallowObjectArrayProps<T> {
    title?: string;
    value: T[];
    fields: {name: string, defaultValue?: string, label?: string, type?: string}[];
    onChange: (event: { target: { name: string; value: any[]; }; }) => void;
}

interface ShallowObjectProps<T> {
    fields: {name: string, defaultValue?: string, label?: string, type?: string}[];
    value?: T;
    onChange: (e: React.ChangeEvent<HTMLInputElement>, field: string) => void;
}

function ShallowObject<T>({fields, value, onChange}: ShallowObjectProps<T>): ReactElement{

    return <BorderedBox>
        {fields.map(field=>{
            let val: string = '';
            if(field.defaultValue) val = field.defaultValue;
            if(value && (value as any)[field.name]) val = (value as any)[field.name]
            if(field.type === 'textarea') return <TextArea
                label={field.label || field.name}
                value={val}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, field.name)}
            />
            return <Text
                label={field.label || field.name}
                value={val}
                onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, field.name)}
            />}
        )}
    </BorderedBox>
}

function ShallowObjectArray<T>({ title, value, onChange, fields }: ShallowObjectArrayProps<T>): ReactElement {
    const [items, setItems] = useState<T[]>(value || []);

    useEffect(() => {
        console.log("items",items)
    }, [items]);

    const handleAddItem = () => {
        // Assuming T is an object, you might want to add a new empty object or a default value.
        // This requires knowing the structure of T or having a factory function for T.
        // For this example, we'll add a new object with the assumption that T can be empty.
        // You might need to adjust this for your specific use case.
        const newItem = {} as T; // This assumes T has a default empty state.
        const updatedItems = [...items, newItem];
        setItems(updatedItems);
    };

    const handleItemChange = (index: number, items: T[], newItem: T) => {
        const updatedItems = items.map((item, i) => i === index ? newItem : item);
        setItems(updatedItems);
        if (onChange) {
          onChange({
            target: {
              name: `items[${index}]`,
              value: updatedItems,
            }
          });
        }
    };

    const handleRemoveItem = (index: number) => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        if(onChange)
            onChange(
                {target: {
                name: `items[${index}]`,
                value: updatedItems,
                }}
            );
    };

    return (
        <Box
            sx={{
                border: '1px solid #ccc',
                boxShadow: 'inset 0px 0px 3px #00000020',
                borderRadius: 1,
                p: 1,
                m: 1,
                backgroundColor: 'background.paper',
            }}
        >
            <Typography variant="body1" component="h4" gutterBottom align='left' marginLeft={1} fontSize="smaller">
                {title}
            </Typography>
            {items.map((item, index) => (
                <Box key={index} alignItems="center" marginBottom={1}>
                    <ShallowObject 
                        fields={fields}
                        value={items[index]}
                        onChange= {(e: React.ChangeEvent<HTMLInputElement>, field: string) => {
                            let newItem: T = Object.assign({}, item);
                            (newItem as any)[field] = e.target.value;
                            handleItemChange(index, items, newItem)
                        }}
                    />
                    <IconButton onClick={() => handleRemoveItem(index)} color="error">
                        <RemoveCircleOutlineIcon />
                    </IconButton>
                </Box>
            ))}
            <Button onClick={handleAddItem} color="primary">Add</Button>
        </Box>
    );
}

export default ShallowObjectArray;
