import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, IconButton, Stack, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Tag {
    key: string;
    value: string;
  }

interface TaggingModalProps {
  open: boolean;
  handleClose: () => void;
  tagsProp: { [key: string]: string[] };
  knownTags: string[];
  applyChanges: (narrativeId: string | string [], tags: { [key: string]: string[] }) => void;
  narrativeId: string | string[];
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const TaggingModal: React.FC<TaggingModalProps> = ({
  open,
  handleClose,
  tagsProp,
  knownTags,
  applyChanges,
  narrativeId,
}) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [keySearch, setKeySearch] = useState('');
  const [valueSearch, setValueSearch] = useState('');

  useEffect(() => {
    const tagsArray = Object.entries(tagsProp).reduce((acc, [key, values]) => {
      // For each value of the key, create a separate entry
      const keyEntries = values.map(value => ({ key, value }));
      return acc.concat(keyEntries);
    }, [] as Tag[]);
  
    // Ensure there's always an empty row at the end for new entries
    if (tagsArray.length === 0 || tagsArray[tagsArray.length - 1].key !== '') {
      tagsArray.push({ key: '', value: '' });
    }
  
    setTags(tagsArray);
  }, [tagsProp]);

  const handleTagChange = (index: number, updatedTag: Partial<Tag>) => {
    const newTags = [...tags];
    newTags[index] = { ...newTags[index], ...updatedTag };
    setTags(newTags);

    // Automatically add an empty row if the last row is edited
    if (index === tags.length - 1 && (updatedTag.key || updatedTag.value)) {
      setTags([...newTags, { key: '', value: '' }]);
    }
  };

  const handleApplyChanges = () => {
    const cleanedTags = tags.reduce((acc, { key, value }) => {
      if (key.trim()) {
        // Split the value string by comma, trim each, and filter out empty strings
        const valuesArray = value.split(',').map(v => v.trim()).filter(v => v);
        // Check if the key already exists
        if (acc[key]) {
          // Concatenate new values with existing ones
          acc[key] = acc[key].concat(valuesArray);
        } else {
          acc[key] = valuesArray;
        }
      }
      return acc;
    }, {} as { [key: string]: string[] });
  
    // Optional: Remove duplicate values under the same key
    Object.keys(cleanedTags).forEach(key => {
      cleanedTags[key] = Array.from(new Set(cleanedTags[key]));
    });
  
    applyChanges(narrativeId, cleanedTags);
    handleClose();
  };
  

  const filteredTags = tags.filter(tag =>
    tag.key.toLowerCase().includes(keySearch.toLowerCase()) &&
    tag.value.toLowerCase().includes(valueSearch.toLowerCase())
  );

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{ position: 'absolute', top: '50%', left: '50%', 
      transform: 'translate(-50%, -50%)', width: 'auto', bgcolor: 'background.paper', 
      border: '2px solid #000', boxShadow: 24, p: 4, 
      maxHeight: '70vh', // Set maximum height to 70% of the viewport height
      overflowY: 'auto' // Enable vertical scrolling
      }}>
        <TextField fullWidth label="Search Key" value={keySearch} onChange={e => setKeySearch(e.target.value)} margin="normal" />
        <TextField fullWidth label="Search Value" value={valueSearch} onChange={e => setValueSearch(e.target.value)} margin="normal" />
        <Divider />
        {filteredTags.map((tag, index) => (
          <Stack direction="row" spacing={1} key={index} alignItems="center">
            <TextField
              fullWidth
              label="Key"
              value={tag.key}
              onChange={e => handleTagChange(index, { key: e.target.value })}
            />
            <TextField
              fullWidth
              label="Value"
              value={tag.value}
              onChange={e => handleTagChange(index, { value: e.target.value })}
            />
            {tags.length > 1 && (
              <IconButton onClick={() => setTags(tags.filter((_, i) => i !== index))}>
                <CloseIcon />
              </IconButton>
            )}
          </Stack>
        ))}
        <Stack direction="row" spacing={2} justifyContent="center" marginTop={2}>
          <Button onClick={handleApplyChanges} variant="contained">Apply</Button>
          <Button onClick={handleClose} variant="outlined">Cancel</Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default TaggingModal;
