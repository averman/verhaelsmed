import { Agent, AgentAction, AgentConnectionCriteria, AgentInput, Connection, isAgentNativeAction, isAgentPrompt, isAgentScript } from "../models/SettingsDataModel";
import { AgentLogs } from "../components/AgentLogs";
import { useNativeFunctionsContext } from "../contexts/NativeFunctionsContext";
import { validateScript } from "./script-utils";
import { useSettingsData } from "../contexts/SettingsDataContext";
import { useState } from "react";


export function useRunAgent() {

    const { saveSettingsData, settingsData } = useSettingsData();
    const variables: { [key: string]: string } = settingsData.variables;

    const nativeFunctions = useNativeFunctionsContext();

    let [actionEvocationCount, setActionEvocationCount] = useState<{ [key: string]: number }>({});
    async function runAction(option :{actionIndex?: number, actionName?: string}, agent: Agent, inputs: AgentInput[], logs: AgentLogs): Promise<void>{
        let action: AgentAction | undefined = undefined;
        let actionIndex = option.actionIndex;
        let resolvedInputs = resolveInputs(inputs);
        
        if(typeof actionIndex !== 'undefined') {
            action = agent.agentActions[actionIndex];
        } else if (option.actionName) {
            actionIndex = agent.agentActions.findIndex(action => action.name === option.actionName);
            if(actionIndex > -1) {
                action = agent.agentActions[actionIndex];
            } else {
                logs.error(`Action ${option.actionName} not found`);
                return;
            }
        }

        if(!action) {
            logs.error(`No action found for index ${actionIndex} or name ${option.actionName}`);
            return;
        }

        let maxEvokedCount = Number.parseInt(action.maxEvokedCount || '1');
        let evokedCount = actionEvocationCount[action.name] || 0;

        if(evokedCount >= maxEvokedCount) {
            logs.info(`Action ${action.name} evoked ${evokedCount} times, with max evoked count ${maxEvokedCount} , stopping...`, `Action-${action.name}`);
            return;
        }

        if(actionEvocationCount[action.name]) {
            actionEvocationCount[action.name]++;
        } else {
            actionEvocationCount[action.name] = 1;
        }
        setActionEvocationCount(actionEvocationCount);

        console.log(action);
        console.log(JSON.stringify(variables, null, 2))
        let type = action.type;
        let logid = `Action-${action.name}`;
        let response: string = "";
        if(isAgentPrompt(action)){
            const connection = resolveConnection(settingsData.connections || [], action.connectionCriteria);
            if(!connection) {
                logs.error(`No connection found for agent with criteria: ${JSON.stringify(action.connectionCriteria)}`, logid);
            } else {
                logs.info("Running Prompt Action: " + action.name, logid);
                let context = resolvePrompt(action.systemContext, resolvedInputs, variables);
                logs.info(context, logid);
                let instruction = resolvePrompt(action.instruction, resolvedInputs, variables);
                logs.info(instruction, logid);
                response = await queryToLLM(context, instruction, connection, logs);
            }
        } else if (isAgentScript(action)){
            logs.info("Running Script Action: " + action.name, logid);
            try{
                let script: string = resolveScript(action.script, resolvedInputs);
                logs.info(script, logid);
                response = eval(script);
            } catch(e) {
                logs.error((e as any).toString(), logid);
            }
        } else if (isAgentNativeAction(action)) {
            logs.info("Running Native Action: " + action.name, logid);
            let parameters: string[] = action.parameters.map(param => {
                return resolveParam(param.parameter, resolvedInputs, variables);
            });
            let nativeAction = action.nativeAction;
            if(nativeFunctions[action.nativeAction]) {
                response = nativeFunctions[action.nativeAction](parameters);
            } else {
                logs.error(`Native function ${action.nativeAction} not found`, logid);
            }
        }

        console.log(`response: ${response} for action ${action.name}`)

        if(action.saveAs) {
            variables[action.saveAs] = response;
            saveSettingsData(settingsData)
        }

        logs.info(response, logid);

        if(action.targets.length>0) {
            let nextTargets = action.targets.map(target => (response.indexOf(target.targetName) > -1)?target:undefined).filter(x=>x)
            if(nextTargets.length>0) {
                logs.info(`Found targets: ${nextTargets.map(x=>x?.targetName).join(', ')}`, logid);
                for(let target of nextTargets) {
                    if(target?.targetName == 'end') {
                        logs.info(`Found end target, stopping actions`, logid);
                        return;
                    }
                    let targetedAction = agent.agentActions.find(action => action.name === target?.targetName);
                    console.log(agent.agentActions, target?.targetName, targetedAction)
                    logs.info(`Targeted action: ${targetedAction?.name}`, logid);
                    if(targetedAction) {
                        logs.info(`Running targeted action: ${targetedAction.name}`, logid);
                        return await runAction({actionName: targetedAction.name}, agent, inputs, logs);
                    }
                }
            } else {
                logs.info(`No targets found, stopping actions`, logid);
                return;
            }
        } else if (typeof actionIndex !== 'undefined' && actionIndex < agent.agentActions.length-1) {
            logs.info(`Continuing to next action`, logid);
            return runAction({actionIndex: actionIndex+1}, agent, inputs, logs);
        } else {
            logs.info(`No more actions to run, finishing...`, logid);
            return;
        }

    }

    return async(agent: Agent, inputs: AgentInput[], logs: AgentLogs) => {
        setActionEvocationCount({});
        return await runAction({actionIndex: 0}, agent, inputs, logs);
    }
}

function resolveConnection(connections: Connection[], agentConnectionCriteria: AgentConnectionCriteria): Connection | undefined {
    let filteredConnections = connections.filter(connection => {
        let isPassing: boolean = true;
        if(agentConnectionCriteria.mandatoryTag) {
            isPassing = agentConnectionCriteria.mandatoryTag.every(tag => connection.tags.includes(tag));
        }
        if(agentConnectionCriteria.negativeMandatoryTag) {
            isPassing = isPassing && !agentConnectionCriteria.negativeMandatoryTag.some(tag => connection.tags.includes(tag));
        }
        return isPassing;
    });
    return filteredConnections[0];
}

function resolveInputs(inputs: AgentInput[]): { key: string, value: string }[] {
    return inputs;
}

function resolvePrompt(initialPrompt: string, inputs: { key: string, value: string }[], variables: { [key: string]: string } ): string {
    let result: RegExpExecArray | null;
    let currentPrompt = initialPrompt;
    do {
        result = /\{\{([^\\{\\}]+)\}\}/g.exec(currentPrompt)
        if (result) {
            let [match, value] = result;
            if (inputs.find(input => input.key === value)) {
                currentPrompt = currentPrompt.replace(match, inputs.find(input => input.key === value)!.value);
            } else if (variables[value]) {
                currentPrompt = currentPrompt.replace(match, variables[value]);
            } else {
                currentPrompt = currentPrompt.replace(match, '');
            }
        }
    } while (result)
    return currentPrompt;
}

async function queryToLLM(context: string, instruction: string, connection: Connection, logs: AgentLogs): Promise<string> {
    try{
        let response = await fetch(connection.connectionHost, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${connection.connectionKey}`,
                "HTTP-Referer": `https://github.com/averman/verhaelsmed`, // Optional, for including your app on openrouter.ai rankings.
                "X-Title": `Verhaelsmed`, // Optional. Shows in rankings on openrouter.ai.
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": connection.model,
                "messages": [
                    { "role": "system", "content": context },
                    { "role": "user", "content": instruction}
                ],
            })
        });
        let responseJson = await response.json();
        return responseJson.choices[0]?.message?.content?.toString();
    } catch(e){
        if(e instanceof Error) {
            logs.error(e.stack || e.message);
        } else logs.error((e as any).toString());
    }
    return "";
}

function resolveScript(script: string, resolvedInputs: { key: string; value: string; }[]): string {
    try{
        validateScript(script);
    }catch(e){
        throw e;
    }

    return script;
}
function resolveParam(param: string, resolvedInputs: { key: string; value: string; }[], variables: { [key: string]: string; }): any {
    let result: RegExpExecArray | null;
    let currentParam = param;
    do {
        result = /\{\{([^\\{\\}]+)\}\}/g.exec(currentParam)
        if (result) {
            let [match, value] = result;
            if (resolvedInputs.find(input => input.key === value)) {
                currentParam = currentParam.replace(match, resolvedInputs.find(input => input.key === value)!.value);
            } else if (variables[value]) {
                currentParam = currentParam.replace(match, variables[value]);
            } else {
                currentParam = currentParam.replace(match, '');
            }
        }
    } while (result)
    return currentParam;
}

