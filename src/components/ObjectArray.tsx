import React, { useState } from "react";
import { ReactElement } from "react";
import { Button, Box, Typography, IconButton, TextField } from '@mui/material';
import {RemoveCircleOutline} from '@mui/icons-material';

interface ObjectArrayProps<T> {
    title?: string;
    value: T[];
    itemRenderer: (item: T, handleChange: (newItem: T) => void)=>ReactElement;
    newItemDefaultValue: T;
    onChange: (event: { target: { name: string; value: any[]; }; }) => void;
}

function ObjectArray<T>({ title, value, itemRenderer, newItemDefaultValue, onChange }: ObjectArrayProps<T>): ReactElement {
    const [items, setItems] = useState<T[]>(value || []);

    const handleAddItem = () => {
        const newItem = newItemDefaultValue;
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
                    {itemRenderer(item, (newItem) => handleItemChange(index, items, newItem))}
                    <IconButton onClick={() => handleRemoveItem(index)} color="error">
                        <RemoveCircleOutline />
                    </IconButton>
                </Box>
            ))}
            <Button onClick={handleAddItem} color="primary">Add</Button>
        </Box>
    );
}

export default ObjectArray;