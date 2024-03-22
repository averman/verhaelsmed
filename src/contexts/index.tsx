// GlobalProvider.js
import React from 'react';
import { SettingsDataProvider } from './SettingsDataContext';

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SettingsDataProvider>
            {children}
        </SettingsDataProvider>
    );
};

export default GlobalProvider;
