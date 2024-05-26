import React, { useState } from 'react';
import { Modal, Box, Grid, List, ListItem, ListItemText, Typography, Button } from '@mui/material';

interface FileModalProps {
  open: boolean;
  onClose: () => void;
  items: {name: string, id: string, description: string}[];
  onSuccess: (id: string) => void;
  selectionTitle?: string;
}

const LoadModal: React.FC<FileModalProps> = ({ open, onClose, items, onSuccess, selectionTitle }) => {
  const [selectedId, setSelectedId] = useState<string>("");

  const handleFileSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleSuccess = () => {
    if (selectedId) {
      onSuccess(selectedId);
      onClose();
    }
  };

  const description = items.find((item) => item.id === selectedId)?.description || '';

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, bgcolor: 'background.paper', boxShadow: 24, p: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              {selectionTitle || 'Select an item'}
            </Typography>
            <List>
              {items.map((item) => (
                <ListItem 
                  button 
                  key={item.id} 
                  onClick={() => handleFileSelect(item.id)}
                  sx={{ 
                    bgcolor: selectedId === item.id ? 'primary.light' : 'transparent',
                    '&:hover': {
                      bgcolor: selectedId === item.id ? 'primary.light' : 'action.hover',
                    },
                  }}
                >
                  <ListItemText primary={item.name} />
                </ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            {selectedId ? <Typography>{description}</Typography> : <Typography>Select an item to see its description.</Typography>}
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSuccess} disabled={!selectedId}>
            Confirm
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default LoadModal;
