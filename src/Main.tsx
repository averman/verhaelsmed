import React, { useState } from 'react';
import { Tabs, Tab, styled, Box } from '@mui/material';
import * as TabComponents from './tabs';

const EditorContainer = styled('div')(({ theme }) => ({
  '.MuiTabs-root': {
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
  },
}));

const Main: React.FC = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  function taborder(name: string): number {
    switch (name) {
      case 'setting':
        return 100;
      case 'story':
        return 101;
      case 'lore':
        return 102;
      case 'sandbox':
        return 1000;
      default:
        return 0;
    }
  }

  const tabs = Object.keys(TabComponents);
  tabs.sort((a, b) => taborder(a) - taborder(b));

  return (
    <Box sx={{height: '96vh'}}>
      <Tabs value={value} onChange={handleChange} sx={{height: '6vh'}}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>
      <Box sx={{height: '90vh', width: '96vw'}}>
        {tabs.map((tabName, index) => {
          const TabComponent = TabComponents[tabName as keyof typeof TabComponents];
          return (
            <div key={index} hidden={value !== index}>
              {value === index && <TabComponent />}
            </div>
          );
        })}
      </Box>
    </Box>
  );
};

export default Main;
