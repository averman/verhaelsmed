import React, { useState } from 'react';
import { Box, IconButton, TextField, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import Narrative from '../core/Narrative';

interface FilterCriteria {
    id: string; // Unique identifier for each filter
    type: 'show' | 'hide';
    criteria: 'all' | 'has tag' | 'not have tag' | 'has tag value';
    tag: string;
    value: string;
}

export interface NarrativeItemsProps {
    narrativeId: string;
    switchEditing: (currentId: string, next: boolean) => void;
    handleContextMenu: (event: React.MouseEvent, items: string[], narrativeId: string) => void;
    initialEditingState: boolean;
    handleEditorSelect: (id: string) => void;
    isSelected: boolean;
}

interface SidebarFilterProps {
    narratives: Narrative[];
    // children: React.ReactNode;
    switchEditing: (currentId: string, next: boolean) => void;
    editableBlockId: number;
    handleContextMenu: (event: React.MouseEvent, items: string[], narrativeId: string) => void;
    handleEditorSelect: (id: string) => void;
    isSelected: (id: string) => boolean;
    component: React.ComponentType<NarrativeItemsProps>;
}


// Define the special filter as a constant outside the component to prevent it from being reinitialized on each render
const defaultSpecialFilter: FilterCriteria = { id: 'special', type: 'show', criteria: 'all', tag: '', value: '' };

function SidebarFilter({ narratives, switchEditing, editableBlockId, handleContextMenu,
    handleEditorSelect, isSelected, component: ChildComponent }: SidebarFilterProps) {
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
    const [filters, setFilters] = useState<FilterCriteria[]>([defaultSpecialFilter]);

    const handleToggleSidebar = () => setSidebarVisible(!sidebarVisible);
    const handleAddFilter = () => {
        const newFilter: FilterCriteria = {
            id: Date.now().toString(), // Simple unique ID based on timestamp
            type: 'show',
            criteria: 'has tag',
            tag: '',
            value: ''
        };
        setFilters([...filters, newFilter]);
    };

    const handleRemoveFilter = (id: string) => {
        if (id === 'special') return; // Prevent deleting the special filter
        setFilters(filters.filter(filter => filter.id !== id));
    };

    const handleFilterChange = (index: number, field: keyof FilterCriteria, value: string) => {
        const newFilters = filters.map((filter, i) =>
            (i === index ? { ...filter, [field]: value } : filter)
        );
        setFilters(newFilters);
    };

    const renderFilterCriteria = (filter: FilterCriteria, index: number) => {
        switch (filter.criteria) {
            case 'has tag':
            case 'has tag value':
                return (
                    <>
                        <Select value={filter.type} onChange={(e) => handleFilterChange(index, 'type', e.target.value as 'show' | 'hide')}>
                            <MenuItem value="show">Show</MenuItem>
                            <MenuItem value="hide">Hide</MenuItem>
                        </Select>
                        <Select value={filter.criteria} onChange={(e) => handleFilterChange(index, 'criteria', e.target.value as FilterCriteria["criteria"])}>
                            <MenuItem value="has tag">Has tag</MenuItem>
                            <MenuItem value="has tag value">Has tag value</MenuItem>
                        </Select>
                        <TextField value={filter.tag} onChange={(e) => handleFilterChange(index, 'tag', e.target.value)} placeholder="Tag Name" />
                        {filter.criteria === 'has tag value' && <TextField value={filter.value} onChange={(e) => handleFilterChange(index, 'value', e.target.value)} placeholder="Tag Value" />}
                    </>
                );
            default:
                return <>

                    <Select value={filter.type} onChange={(e) => handleFilterChange(index, 'type', e.target.value as 'show' | 'hide')}>
                        <MenuItem value="show">Show</MenuItem>
                        <MenuItem value="hide">Hide</MenuItem>
                    </Select>
                    <Typography>all</Typography>
                </>
        }
    };

    const sortedNarratives = narratives.sort((a, b) => a.timeline - b.timeline);
    const filteredNarratives = sortedNarratives.filter(narrative => {
        for(let i = filters.length - 1; i >= 0; i--) {
            const filter = filters[i];
            if (filter.criteria === 'all') return filter.type === 'show';
            if (filter.criteria === 'has tag') {
                if (narrative.tags[filter.tag]) return filter.type === 'show';
            }
            if (filter.criteria === 'has tag value') {
                if (narrative.tags[filter.tag] && narrative.tags[filter.tag].includes(filter.value)) return filter.type === 'show';
            }
        }
    });

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh' }}>
            {sidebarVisible && (
                <Box sx={{ width: 300, borderRight: '1px solid #ccc', padding: 2 }}>
                    {filters.map((filter, index) => (
                        <Card key={index} sx={{ marginBottom: 2 }}>
                            <CardContent>
                                {renderFilterCriteria(filter, index)}
                            </CardContent>
                            {index !== 0 && (
                                <CardActions>
                                    <IconButton aria-label="delete" onClick={() => handleRemoveFilter(filter.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </CardActions>
                            )}
                        </Card>
                    ))}
                    <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddFilter}>
                        Add Criteria
                    </Button>
                </Box>
            )}
            <Box sx={{ flex: 1, overflow: 'auto' }}>
                {filteredNarratives.map((narrative, i) => (
                    <ChildComponent key={narrative.id}
                        narrativeId={narrative.id}
                        switchEditing={switchEditing}
                        initialEditingState={i == editableBlockId ? true : false}
                        handleContextMenu={handleContextMenu}
                        handleEditorSelect={handleEditorSelect}
                        isSelected={isSelected(narrative.id)}
                    />
                ))}
            </Box>
            <IconButton
                aria-label="toggle sidebar"
                onClick={handleToggleSidebar}
                sx={{ position: 'absolute', left: sidebarVisible ? 300 : 0, top: '5%' }}
            >
                <MenuIcon />
            </IconButton>
        </Box>
    );
};

export default SidebarFilter;
