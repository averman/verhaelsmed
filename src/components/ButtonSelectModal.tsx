import React from 'react';
import { Button, Modal, Box, Typography } from '@mui/material';

interface ButtonProps {
    title: string;
    isVisible?: () => boolean;
    onClick: (e: React.MouseEvent, target: any, title: string) => void;
  }

interface ButtonSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    buttons: ButtonProps[];
    target: any;
    title?: string;
}

const CustomModal: React.FC<ButtonSelectModalProps> = ({ isOpen, onClose, buttons, title, target }) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
      }}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          {title || 'Select an action'}
        </Typography>
        <Box id="modal-modal-description" sx={{ mt: 2 }}>
          {buttons.filter(button => !button.isVisible || button.isVisible()).map((button, index) => (
            <Button key={index} variant="contained" onClick={e=>button.onClick(e,target,button.title)} sx={{ mr: 2 }}>
              {button.title}
            </Button>
          ))}
          <Button variant="outlined" onClick={onClose}>Cancel</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default CustomModal;
