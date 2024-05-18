import React, { useEffect, useState } from 'react';
import { useSettingsData } from '../contexts/SettingsDataContext';
import { BorderedBox, Dropdown } from '../components/Deco';
import Button from '@mui/material/Button';
import ShallowObjectArray from '../components/ShallowObjectArray';
import { Agent } from '../models/SettingsDataModel';
import AgentLogWindow, { AgentLogs } from '../components/AgentLogs';
import { useRunAgent } from '../agents/agents-utils';
import { useMiscLocalContext } from '../contexts/MixedLocalContext';

const Sandbox: React.FC = () => {
    const { settingsData } = useSettingsData();
    const [activeAgentIndex, setActiveAgentIndex] = useState<number>(-1);
    const [agentNames, setAgentNames] = useState<string[]>([]);
    const [activeAgentName, setActiveAgentName] = useState<string>('');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [activeAgent, setActiveAgent] = useState<Agent | undefined>(undefined);
    const [inputs, setInputs] = useState<any[]>([]);
    const { logs, setLogs, createNewLog } = useMiscLocalContext();

    useEffect(() => {
        setAgents(settingsData?.agents || []);
        setActiveAgent(activeAgentIndex>-1?agents[activeAgentIndex]:undefined);
        if (activeAgent) {
            setInputs(activeAgent.inputs || []);
            setActiveAgentName(`[${agents[activeAgentIndex].agentType || 'Agent'}] ${agents[activeAgentIndex].agentName}`);
        }
    }, [settingsData])

    useEffect(() => {
        setAgentNames(agents.map(agent => `[${agent.agentType || "Agent"}] ${agent.agentName}`));
    }, [agents])

    useEffect(() => {
        console.log('activeAgentIndex', activeAgentIndex, agents[activeAgentIndex]);
        if(activeAgentIndex>-1) {
            setActiveAgentName(`[${agents[activeAgentIndex].agentType || 'Agent'}] ${agents[activeAgentIndex].agentName}`);
            setInputs(agents[activeAgentIndex].inputs || []);
        }
        setActiveAgent(activeAgentIndex>-1?agents[activeAgentIndex]:undefined);
    },[activeAgentIndex])

    const runAction = useRunAgent();

    const handleSubmit = async () => {
        const agent = agents[activeAgentIndex];
        const agentLogs = createNewLog();
        await runAction(agent, inputs, agentLogs);
    }

    return <>
        <Dropdown
            label='Agent'
            value={activeAgentName}
            onChange={(event: React.ChangeEvent<{ value: unknown }>) => {
                let agentName = event.target.value as string;
                agentName = agentName.replace(/\[.*\]/, '').trim();
                let idx = agents.findIndex(agent => agent.agentName === agentName);
                setActiveAgentIndex(idx);
            }}
            options={["", ...agentNames]}
        />
        {activeAgent && (<>
            <BorderedBox title='inputs' collapsible>
                <ShallowObjectArray
                    value = {inputs}
                    onChange = {(e: {target: {name: string, value: any[]}}) => {
                        setInputs([...e.target.value]);
                    }}
                    fields = {[
                        {name: 'key', label: 'Key'},
                        {name: 'value', label: 'Value', type: 'textarea'}
                    ]}
                />
            </BorderedBox>
            <Button onClick={handleSubmit}>Submit</Button>
        </>)}
        <BorderedBox title='logs' collapsible>
            {logs.map((log, idx) => <AgentLogWindow key={idx} log={log}/>)}
        </BorderedBox>
    </>
}

export default Sandbox;