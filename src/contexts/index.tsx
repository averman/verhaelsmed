// GlobalProvider.js
import React from 'react';
import { SettingsDataProvider } from './SettingsDataContext';
import { NarrativeDataProvider } from './NarrativeDataContext';

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SettingsDataProvider>
            <NarrativeDataProvider>
                {children}
            </NarrativeDataProvider>
        </SettingsDataProvider>
    );
};

export default GlobalProvider;
