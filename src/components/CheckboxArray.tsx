import React, { useState, useEffect } from 'react';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material';

interface CheckboxArrayProps {
  title: string;
  options: string[]; // Array of options to be displayed as checkboxes
  value: string[]; // Array of checked values
  onChange?: (event: { target: { value: any[]; }; }) => void; // Adjust the type as necessary
}

const CheckboxArray: React.FC<CheckboxArrayProps> = ({
  title,
  options,
  value,
  onChange,
}) => {
  const [checkedState, setCheckedState] = useState<string[]>(value || []);

  useEffect(() => {
    setCheckedState(value || []);
  }, [value]);

  const handleCheckboxChange = (checkedValue: string, isChecked: boolean) => {
    let updatedCheckedState: string[] = [];
    if (isChecked) {
      // Add the checked value to the array
      updatedCheckedState = [...checkedState, checkedValue];
    } else {
      // Remove the unchecked value from the array
      updatedCheckedState = checkedState.filter((item) => item !== checkedValue);
    }
    setCheckedState(updatedCheckedState);
    if(onChange)
        onChange({
            target: {
                value: updatedCheckedState,
                }
        });
  };

  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        boxShadow: 'inset 0px 0px 3px #00000020',
        borderRadius: 1,
        p: 2,
        m: 1,
        backgroundColor: 'background.paper',
      }}
    >
      <Typography variant="h6" component="h3" gutterBottom fontSize="smaller" align='left' marginLeft={1}>
        {title}
      </Typography>
      <FormGroup row>
        {options.map((option, index) => (
          <FormControlLabel
            key={index}
            control={
              <Checkbox
                checked={checkedState.includes(option)}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                name={option}
              />
            }
            label={option}
          />
        ))}
      </FormGroup>
    </Box>
  );
};

export default CheckboxArray;
