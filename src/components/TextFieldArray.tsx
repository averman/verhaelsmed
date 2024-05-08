import React, { useState, useEffect, ReactElement } from 'react';
import { Button, Box, Typography, IconButton } from '@mui/material';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// Define the types for the props
interface TextFieldArrayProps {
  title: string;
  value: string[]; // You might want to replace any with a more specific type
  onChange?: (event: { target: { name: string; value: any[]; }; }) => void; // Adjust the type as necessary
  children: ReactElement;
}

const TextFieldArray: React.FC<TextFieldArrayProps> = ({ title, value, onChange, children }) => {
  const [items, setItems] = useState<any[]>(value || []); // Replace any with a more specific type if possible

  useEffect(() => {
    setItems(value || []);
  }, [value]);

  const handleAddItem = () => {
    const updatedItems = [...items, ''];
    // This seems to just re-add existing items without changes. You might have missed adding a new item here.
    setItems(updatedItems);
  };

  const handleItemChange = (index: number, newValue: any) => { // Replace any with the specific type of your item
    const updatedItems = items.map((item, i) => i === index ? newValue : item);
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
            border: '1px solid #ccc', // Light grey border
            boxShadow: 'inset 0px 0px 3px #00000020', // Soft inner shadow for embossed effect
            borderRadius: 1, // Slightly rounded corners
            p: 1, // Padding inside the box
            m: 1, // Margin around the box
            backgroundColor: 'background.paper', // Use theme's paper color or any color you prefer
        }}
    >
    <Typography variant="body1" component="h4" gutterBottom align='left' marginLeft={1} fontSize="smaller">
        {title}
    </Typography>
      {items.map((item, index) => (
        <Box key={index} display="flex" alignItems="center" marginBottom={2}>
            {React.cloneElement(children, {
                key: `item-${index}`,
                value: item,
                onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleItemChange(index, e.target.value),
                // Add other props as needed, depending on the child component's requirements
            })}
            <IconButton key={`button-${index}`} onClick={() => handleRemoveItem(index)} color="error">
                <RemoveCircleOutlineIcon key={index} />
            </IconButton>
        </Box>
      ))}
      <Button onClick={handleAddItem} color="primary">Add</Button>
    </Box>
  );
};

export default TextFieldArray;
