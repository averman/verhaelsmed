import React, { ReactElement, useEffect, useState } from 'react';
import { Box, IconButton, TextField, Button, Select, MenuItem, FormControl, InputLabel, Card, CardContent, CardActions, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import Narrative from '../core/Narrative';
import {db} from '../utils/IndexedDbUtils';
import { FilterCriteria, filterNarratives } from '../agents/filter-utils';

export interface NarrativeItemsProps {
    narrativeId: string;
    switchEditing: (currentId: string, next: boolean) => void;
    handleContextMenu: (event: React.MouseEvent, items: string[], narrativeId: string) => void;
    initialEditingState: boolean;
    handleEditorSelect: (id: string) => void;
    isSelected: boolean;
}

interface SidebarFilterProps {
    projectId: string;
    narratives: Narrative[];
    // children: React.ReactNode;
    switchEditing: (currentId: string, next: boolean) => void;
    editableBlockId: number;
    handleContextMenu: (event: React.MouseEvent, items: string[], narrativeId: string) => void;
    handleEditorSelect: (id: string) => void;
    isSelected: (id: string) => boolean;
    component: React.ComponentType<NarrativeItemsProps>;
    filterId: string;
    rightBarComponent?: ReactElement;
}


// Define the special filter as a constant outside the component to prevent it from being reinitialized on each render
const defaultSpecialFilter: FilterCriteria = { id: 'special', type: 'show', criteria: 'all', tag: '', value: '' };

function SidebarFilter({ projectId, narratives, switchEditing, editableBlockId, handleContextMenu,
    handleEditorSelect, isSelected, filterId, rightBarComponent, component: ChildComponent }: SidebarFilterProps) {
    const [sidebarVisible, setSidebarVisible] = useState<boolean>(true);
    const [filters, setFilters] = useState<FilterCriteria[]>([defaultSpecialFilter]);
    const [filtersLoaded, setFiltersLoaded] = useState<boolean>(false);

    const handleToggleSidebar = () => setSidebarVisible(!sidebarVisible);

    useEffect(() => {
        if(filtersLoaded) db.settingPersistance.put({id: 'filters', projectId, data: filters});
    }, [filters, filtersLoaded, projectId]);

    useEffect(() => {
        const loadFilters = async () => {
            const loadingFilters = await db.settingPersistance.get(['filters', projectId]);
            if (loadingFilters) {
                setFilters(loadingFilters.data);
            }
            setFiltersLoaded(true);
        };
        loadFilters();
    }, [projectId]);

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
    let filteredNarratives = filterNarratives(sortedNarratives, filters);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
            {sidebarVisible && (
                <Box sx={{ width: 300, borderRight: '1px solid #ccc', overflow: 'auto', height: '90vh' }}>
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
            <Box sx={{ flex: 1, overflow: 'auto', height: '90vh', backgroundColor: '#f7f7f7' }}>
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
                <Box sx={{ width: 300, borderRight: '1px solid #ccc', overflow: 'auto', height: '90vh' }}>
                    {rightBarComponent}
                </Box>
            <IconButton
                aria-label="toggle sidebar"
                onClick={handleToggleSidebar}
                sx={{ position: 'absolute', left: sidebarVisible ? 270 : -30, top: '5%' }}
            >
                <MenuIcon />
            </IconButton>
        </Box>
    );
};

export default SidebarFilter;
