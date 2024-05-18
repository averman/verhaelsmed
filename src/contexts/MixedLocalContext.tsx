import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { AgentLogs } from '../components/AgentLogs'; // Ensure this import is correct

// Define the types for LogArray
type LogArray = AgentLogs[];

// Define the type for the context value
interface MiscLocalContextType {
  logs: LogArray;
  setLogs: (logs: LogArray) => void;
  createNewLog: () => AgentLogs;
  getCurrentLog: () => AgentLogs;
}

// Create the context with a default value
const MiscLocalContext = createContext<MiscLocalContextType | undefined>(undefined);

// Define the maximum number of logs
const maxLogLength = 10;

// Create a provider component
const MiscLocalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Define the initial state by reading from localStorage or using default values
  const [logs, setLogs] = useState<LogArray>(() => {
    const savedLogs = localStorage.getItem('logs');
    return savedLogs ? deserializeLogs(savedLogs) : [];
  });

  function deserializeLogs(logsData: string): AgentLogs[] {
      const logs: AgentLogs[] = [];
      const logsArray = JSON.parse(logsData);
      for (const logData of logsArray) {
          const log = new AgentLogs();
          log.id = logData.id;
          log.open = logData.open;
          log.close = logData.close;
          log.logs = logData.logs;
          logs.push(log);
      }
      return logs;
  }

  // Save to localStorage whenever logs change
  useEffect(() => {
    logs.forEach(log => {
        log.updateLog = () => setLogs([...logs]);
    });
    localStorage.setItem('logs', JSON.stringify(logs));
  }, [logs]);

  const createNewLog = (): AgentLogs => {
    const newLog = new AgentLogs();
    const updatedLogs = [...logs, newLog];
    if (updatedLogs.length > maxLogLength) {
      updatedLogs.shift();
    }
    setLogs(updatedLogs);
    return newLog;
  };

  const getCurrentLog = (): AgentLogs => {
    return logs[logs.length - 1];
  };

  return (
    <MiscLocalContext.Provider value={{ logs, setLogs, createNewLog, getCurrentLog }}>
      {children}
    </MiscLocalContext.Provider>
  );
};

// Create a custom hook to use the MiscLocalContext
const useMiscLocalContext = () => {
  const context = useContext(MiscLocalContext);
  if (!context) {
    throw new Error('useMiscLocalContext must be used within a MiscLocalProvider');
  }
  return context;
};

export { MiscLocalProvider, useMiscLocalContext };
