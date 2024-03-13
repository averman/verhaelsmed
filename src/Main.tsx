import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import * as TabComponents from './tabs';

const Main: React.FC = () => {
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabs = Object.keys(TabComponents);

  return (
    <>
      <Tabs value={value} onChange={handleChange}>
        {tabs.map((tab, index) => (
          <Tab key={index} label={tab} />
        ))}
      </Tabs>
      {tabs.map((tabName, index) => {
        const TabComponent = TabComponents[tabName as keyof typeof TabComponents];
        return (
          <div key={index} hidden={value !== index}>
            {value === index && <TabComponent />}
          </div>
        );
      })}
    </>
  );
};

export default Main;
