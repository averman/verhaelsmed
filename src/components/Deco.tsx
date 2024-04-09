import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, TextField } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import exp from 'constants';

export const BorderedBox: React.FC<{ title?: string, collapsible?: boolean }> = ({ title, children, collapsible }) => {
    if (collapsible)
        return (
            <Accordion
                sx={{
                    border: '1px solid #ccc', // Light grey border
                    boxShadow: 'inset 0px 0px 10px #00000020', // Soft inner shadow for embossed effect
                    borderRadius: 1, // Slightly rounded corners
                    m: 1, // Margin around the box
                    backgroundColor: 'background.paper', // Use theme's paper color
                    '&:before': { display: 'none' }, // Remove the default MUI Accordion expand line
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    sx={{
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
                    }}
                >
                    {children}
                </AccordionDetails>
            </Accordion>
        );
    else
        return (<Box
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
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement> 
}> = ({ label, value, onChange }) => {
    return <TextField
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        name={label.split(' ').join('')}
    />
}

export const Dropdown: React.FC<{
    label: string,
    value: string,
    options: string[], 
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement> 
}> = ({ label, value, options, onChange }) => {
    return <TextField
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        name={label.split(' ').join('')}
        select
        SelectProps={{ native: true }}
    >
        <option value=""></option>
        {options.map(type => (
            <option key={type} value={type}>{type}</option>
        ))}
    </TextField>
}

export const TextArea: React.FC<{
    label: string,
    value: string, 
    onChange: React.ChangeEventHandler<HTMLInputElement| HTMLTextAreaElement> 
}> = ({ label, value, onChange }) => {
    return <TextField
        multiline
        label={label}
        value={value}
        onChange={onChange}
        margin="normal"
        fullWidth
        minRows={4}
        name={label.split(' ').join('')}
        sx={{
            '& .MuiOutlinedInput-root': {
              overflow: 'auto' // Ensures the content fits within the resizable area
            }
          }}
    />
}

