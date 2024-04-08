import React from 'react';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
            width={'100%'}
            sx={{
                border: '1px solid #ccc', // Light grey border
                boxShadow: 'inset 0px 0px 10px #00000020', // Soft inner shadow for embossed effect
                borderRadius: 1, // Slightly rounded corners
                m: 1, // Margin around the box
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
