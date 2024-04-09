import React, { useEffect, useState } from 'react';
import { useSettingsData } from '../contexts/SettingsDataContext';
import { BorderedBox, Dropdown } from '../components/Deco';
import Button from '@mui/material/Button';
import ShallowObjectArray from '../components/ShallowObjectArray';
import { Agent } from '../models/SettingsDataModel';
import AgentLogWindow, { AgentLog } from '../components/AgentLogs';

const Sandbox: React.FC = () => {
    const { settingsData } = useSettingsData();
    const [activeAgentIndex, setActiveAgentIndex] = useState<number>(-1);
    const [agentNames, setAgentNames] = useState<string[]>([]);
    const [activeAgentName, setActiveAgentName] = useState<string>('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [activeAgent, setActiveAgent] = useState<Agent | undefined>(undefined);
    const [inputs, setInputs] = useState<any[]>([]);
    const [logs, setLogs] = useState<AgentLog | undefined>(undefined);

    useEffect(() => {
        setAgents(settingsData?.agents || []);
        setActiveAgent(activeAgentIndex>-1?agents[activeAgentIndex]:undefined);
        if (activeAgent) {
            setInputs(activeAgent.inputs || []);
            setActiveAgentName(`[${agents[activeAgentIndex].agentType}] ${agents[activeAgentIndex].agentName}`);
        }
    }, [settingsData])

    useEffect(() => {
        setAgentNames(agents.map(agent => `[${agent.agentType}] ${agent.agentName}`));
    }, [agents])

    useEffect(() => {
        if(activeAgentIndex>-1) {
            setActiveAgentName(`[${agents[activeAgentIndex].agentType}] ${agents[activeAgentIndex].agentName}`);
            setInputs(agents[activeAgentIndex].inputs || []);
        }
        setActiveAgent(activeAgentIndex>-1?agents[activeAgentIndex]:undefined);
    },[activeAgentIndex])

    const handleSubmit = () => {
        setLogs(new AgentLog('test'));
    }

    return <>
        <Dropdown
            label='Agent'
            value={activeAgentName}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                let agentName = event.target.value as string;
                agentName = agentName.replace(/\[.*\]/, '').trim();
                let idx = agents.findIndex(agent => agent.agentName === agentName);
                console.log(agentName, idx);
                setActiveAgentIndex(idx);
            }}
            options={agentNames}
        />
        {activeAgent && (<>
            <BorderedBox title='inputs' collapsible>
                <ShallowObjectArray
                    value = {inputs}
                    onChange = {(e: {target: {name: string, value: any[]}}) => {
                        setInputs({...e.target.value});
                    }}
                    fields = {[
                        {name: 'key', label: 'Key'},
                        {name: 'value', label: 'Value', type: 'textarea'}
                    ]}
                />
            </BorderedBox>
            <Button onClick={handleSubmit}>Submit</Button>
            <AgentLogWindow log={logs}/>
        </>)}
    </>
}

export default Sandbox;