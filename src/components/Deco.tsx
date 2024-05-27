import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField, 
    FilledInputProps, OutlinedInputProps, InputProps } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import exp from 'constants';

export const BorderedBox: React.FC<{ 
        title?: string, 
        collapsible?: boolean,
        onContextMenu?: React.MouseEventHandler<HTMLDivElement> | undefined,
        sx?: React.CSSProperties
    }> = ({ title, children, collapsible, onContextMenu, sx }) => {
    let thisSx: React.CSSProperties = {
        border: '1px solid #ccc', // Light grey border
        boxShadow: 'inset 0px 0px 10px #00000020', // Soft inner shadow for embossed effect
        borderRadius: 1, // Slightly rounded corners
        margin: 1, // Margin around the box
        backgroundColor: 'background.paper', // Use theme's paper color
        // '&:before': { display: 'none' }, // Remove the default MUI Accordion expand line
    }
    if(sx) thisSx = {...thisSx, ...sx}
    if (collapsible)
        return (
            <Accordion
                onContextMenu={onContextMenu}
                sx={thisSx}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    sx={{
                        width: '100%', // Ensure the summary spans the full width
                        padding: '0 1rem', // Adjust padding as needed
                        minHeight: '48px', // Prevents the title bar from shrinking smaller than content
                        '& .MuiAccordionSummary-content': {
                            margin: '0', // Adjusts vertical spacing to ensure alignment
                        },
                    }}
                >{
                        title ? <Typography variant="body1" component="h4" gutterBottom>
                            {title}
                        </Typography> : ''
                    }
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        p: 1, // Padding inside the details box
                        width: '100%', // Ensure the details box spans the full width
                    }}
                >
                    {children}
                </AccordionDetails>
            </Accordion>
        );
    else
        return (<Box
            onContextMenu={onContextMenu}
            sx={{
                border: '1px solid #ccc', // Light grey border
                boxShadow: 'inset 0px 0px 10px #00000020', // Soft inner shadow for embossed effect
                borderRadius: 1, // Slightly rounded corners
                m: 1, // Margin around the box
                p: 1,
                backgroundColor: 'background.paper', // Use theme's paper color
            }}
        >
            {
                title ? <Typography variant="body1" component="h4" gutterBottom>
                    {title}
                </Typography> : ''
            }
            {children}
        </Box>)
};

export const Text: React.FC<{
    label: string,
    value: string, 
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement>,
    InputProps?: Partial<FilledInputProps> | Partial<OutlinedInputProps> | Partial<InputProps> | undefined
}> = ({ label, value, onChange, InputProps }) => {
    return <TextField
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        InputProps={InputProps}
        name={label.split(' ').join('')}
    />
}

export const Dropdown: React.FC<{
    label: string,
    value: string,
    options: string[], 
    sx?: React.CSSProperties,
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement> 
}> = ({ label, value, options, onChange, sx }) => {
    return <TextField
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        name={label.split(' ').join('')}
        select
        SelectProps={{ native: true }}
        sx={sx}
    >
        {options.map(type => (
            <option key={type} value={type}>{type}</option>
        ))}
    </TextField>
}

export const TextArea: React.FC<{
    label: string,
    value: string, 
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement>,
    minRows?: number
    sx?: React.CSSProperties
}> = ({ label, value, onChange, minRows, sx }) => {
    let localSx: React.CSSProperties = {
        overflow: 'auto' // Ensures the content fits within the resizable area
      }
    if (sx) localSx = {...localSx, ...sx}
    
    return <TextField
        multiline
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        minRows={minRows || 4}
        name={label.split(' ').join('')}
        sx={localSx}
    />
}

