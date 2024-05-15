// GlobalProvider.js
import React from 'react';
import { SettingsDataProvider } from './SettingsDataContext';
import { NarrativeDataProvider } from './NarrativeDataContext';
import { NativeFunctionsProvider } from './NativeFunctionsContext';

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SettingsDataProvider>
            <NarrativeDataProvider>
                <NativeFunctionsProvider>
                    {children}
                </NativeFunctionsProvider>
            </NarrativeDataProvider>
        </SettingsDataProvider>
    );
};

export default GlobalProvider;
