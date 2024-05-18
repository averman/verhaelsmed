// GlobalProvider.js
import React from 'react';
import { SettingsDataProvider } from './SettingsDataContext';
import { NarrativeDataProvider } from './NarrativeDataContext';
import { NativeFunctionsProvider } from './NativeFunctionsContext';
import { MiscLocalProvider } from './MixedLocalContext';

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <SettingsDataProvider>
            <NarrativeDataProvider>
                <NativeFunctionsProvider>
                    <MiscLocalProvider>
                        {children}
                    </MiscLocalProvider>
                </NativeFunctionsProvider>
            </NarrativeDataProvider>
        </SettingsDataProvider>
    );
};

export default GlobalProvider;
