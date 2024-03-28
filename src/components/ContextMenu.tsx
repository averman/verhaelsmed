// Filename: src/component/ContextMenu.tsx

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export interface ContextMenuItem {
    title: string;
    action: () => void;
}

interface ContextMenuProps {
    mouseX: number;
    mouseY: number;
    visible: boolean;
    menuItems: ContextMenuItem[];
}

const ContextMenu: React.FC<ContextMenuProps> = ({ mouseX, mouseY, visible, menuItems }) => {
    if (!visible) return null;

    return (
        <Box
            id="context-menu"
            sx={{
                position: 'fixed',
                top: `${mouseY}px`,
                left: `${mouseX}px`,
                bgcolor: 'background.paper',
                boxShadow: 3,
                borderRadius: 1,
                zIndex: 1000, // Ensure it's above other elements
            }}
        >
            {menuItems.map((item, index) => (
                <Typography key={index} sx={{ p: 1, cursor: 'pointer' }} onClick={item.action}>
                    {item.title}
                </Typography>
            ))}
        </Box>
    );
};

export default ContextMenu;
