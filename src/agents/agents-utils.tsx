import { Agent, AgentAction, AgentConnectionCriteria, AgentInput, Connection, isAgentNativeAction, isAgentPrompt, isAgentScript } from "../models/SettingsDataModel";
import { AgentLogs } from "../components/AgentLogs";
import { useNativeFunctionsContext } from "../contexts/NativeFunctionsContext";
import { validateScript } from "./script-utils";
import { useSettingsData } from "../contexts/SettingsDataContext";
import { useState } from "react";
import { useNarrativeData } from "../contexts/NarrativeDataContext";
import { filterLore } from "./filter-utils";
import LoreNarrative from "../core/LoreNarrative";


export function useRunAgent() {

    const { saveSettingsData, settingsData } = useSettingsData();
    const { narrativeData } = useNarrativeData();
    const variables: { [key: string]: string } = settingsData.variables;


    function resolveString(textString: string, resolvedInputs: { key: string; value: string; }[], variables: { [key: string]: string; }): any {
        let result: RegExpExecArray | null;
        let currentText = textString;
        let lastEvaluatedLores: LoreNarrative | undefined = undefined;
        do {
            result = /\{\{([^\\{\\}]+)\}\}/g.exec(currentText)
            if (result) {
                let [match, value] = result;
                if (value.startsWith("_") && typeof lastEvaluatedLores !== "undefined") {
                    value = value.replace(
                        "_",
                        `lore.${(lastEvaluatedLores as LoreNarrative).loreType}.${(lastEvaluatedLores as LoreNarrative).loreId}`
                    );
                }
                if (value.startsWith("lore") || value.startsWith("$")) {
                    let loreValue = value.replace("$", "lore");
                    let timelineText = resolvedInputs.find(input => input.key === "timeline")?.value ||
                        variables["timeline"] || "0";
                    let timeline = parseFloat(timelineText);
                    let text = resolvedInputs.find(input => input.key === "text")?.value || variables["text"] || "";
                    let context = resolvedInputs.find(input => input.key === "context")?.value || variables["context"] || "";
                    if(Number.isNaN(timeline)) timeline = Number.POSITIVE_INFINITY;
                    let lores = filterLore(Object.values(narrativeData.lore) as LoreNarrative[], timeline);
                    let parts = loreValue.split(".");
                    if(parts.length > 1) 
                        lores = lores.filter(lore => lore.loreType == parts[1]);
                    let replaceWith: string = '';
                    if(parts.length >2){
                        if(parts[2]=='**'){
                            replaceWith = lores.map(x=>(x as LoreNarrative).loreId).join(";")
                        } else if(parts[2].includes("::")){
                            let [part3, key] = parts[2].split("::");
                            lastEvaluatedLores = lores.filter(lore => lore.loreId == part3)[0];
                            if(!lastEvaluatedLores) replaceWith = "";
                            else replaceWith = lastEvaluatedLores.items[key];
                        } else {
                            lastEvaluatedLores = lores.filter(lore => lore.loreId == parts[2])[0];
                            if(!lastEvaluatedLores) {
                                replaceWith = "";
                            } else replaceWith = lastEvaluatedLores.getNormalizedText({text, context});
                        }
                    } else replaceWith = lores.map(lore => lore.getNormalizedText({text, context})).join("\n\n");
                    currentText = currentText.replace(match, replaceWith);
                } else if (resolvedInputs.find(input => input.key === value)) {
                    currentText = currentText.replace(match, resolvedInputs.find(input => input.key === value)!.value);
                } else if (variables[value]) {
                    currentText = currentText.replace(match, variables[value]);
                } else {
                    currentText = currentText.replace(match, '');
                }
            }
        } while (result)
        return currentText;
    }

    const nativeFunctions = useNativeFunctionsContext();

    let [actionEvocationCount, setActionEvocationCount] = useState<{ [key: string]: number }>({});
    async function runAction(option: { actionIndex?: number, actionName?: string }, agent: Agent, inputs: AgentInput[], logs: AgentLogs): Promise<void> {
        let action: AgentAction | undefined = undefined;
        let actionIndex = option.actionIndex;
        let resolvedInputs = resolveInputs(inputs);

        if (typeof actionIndex !== 'undefined') {
            action = agent.agentActions[actionIndex];
        } else if (option.actionName) {
            actionIndex = agent.agentActions.findIndex(action => action.name === option.actionName);
            if (actionIndex > -1) {
                action = agent.agentActions[actionIndex];
            } else {
                logs.error(`Action ${option.actionName} not found`);
                return;
            }
        }

        if (!action) {
            logs.error(`No action found for index ${actionIndex} or name ${option.actionName}`);
            return;
        }

        let maxEvokedCount = Number.parseInt(action.maxEvokedCount || '1');
        let evokedCount = actionEvocationCount[action.name] || 0;

        if (evokedCount >= maxEvokedCount) {
            logs.info(`Action ${action.name} evoked ${evokedCount} times, with max evoked count ${maxEvokedCount} , stopping...`,
                `Action-${action.name}`, "Stopping action because of max evoked count reached");
            logs.close++;
            return;
        }

        if (actionEvocationCount[action.name]) {
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
        if (isAgentPrompt(action)) {
            const connection = resolveConnection(settingsData.connections || [], action.connectionCriteria);
            if (!connection) {
                logs.error(`No connection found for agent with criteria: ${JSON.stringify(action.connectionCriteria)}`,
                    logid, "No connection found");
            } else {
                logs.info("Running Prompt Action: " + action.name, logid, "Running Prompt Action: " + action.name);
                let context = resolveString(action.systemContext, resolvedInputs, variables);
                logs.info(context, logid, "context");
                let instruction = resolveString(action.instruction, resolvedInputs, variables);
                logs.info(instruction, logid, "instruction");
                response = await queryToLLM(context, instruction, connection, logs);
            }
        } else if (isAgentScript(action)) {
            logs.info("Running Script Action: " + action.name, logid, "Running Script Action: " + action.name);
            try {
                let script: string = resolveScript(action.script, resolvedInputs);
                logs.info(script, logid, "the script");
                response = eval(script);
            } catch (e) {
                logs.error((e as any).toString(), logid);
            }
        } else if (isAgentNativeAction(action)) {
            logs.info("Running Native Action: " + action.name, logid, "Running Native Action: " + action.name);
            let parameters: string[] = action.parameters.map(param => {
                return resolveString(param.parameter, resolvedInputs, variables);
            });
            if (nativeFunctions[action.nativeAction]) {
                response = await nativeFunctions[action.nativeAction](parameters);
            } else {
                logs.error(`Native function ${action.nativeAction} not found`, logid, "native function not found");
            }
        }

        console.log(`response: ${response} for action ${action.name}`)

        if (action.saveAs) {
            variables[action.saveAs] = response;
            saveSettingsData(settingsData)
        }

        logs.info(response, logid, "response");

        if (action.targets.length > 0) {
            let nextTargets = action.targets.map(target => (response.indexOf(target.targetName) > -1) ? target : undefined).filter(x => x)
            if (nextTargets.length > 0) {
                for (let target of nextTargets) {
                    if (target?.targetName == 'end') {
                        logs.info(`Found end target, stopping actions`, logid, "stopping actions because end reached");
                        logs.close++;
                        return;
                    }
                    let targetedAction = agent.agentActions.find(action => action.name === target?.targetName);
                    console.log(agent.agentActions, target?.targetName, targetedAction)
                    if (targetedAction) {
                        logs.info(`Running targeted action: ${targetedAction.name}`, logid, `Running targeted action: ${targetedAction.name}`);
                        return await runAction({ actionName: targetedAction.name }, agent, inputs, logs);
                    } else {
                        logs.error(`No action found for target ${target?.targetName}. Stopping actions`, logid,
                            `No action found for target ${target?.targetName}`);
                        logs.close++;
                        return;
                    }
                }
            } else {
                logs.info(`No targets found, stopping actions`, logid, "No targets found, stopping actions");
                logs.close++;
                return;
            }
        } else if (typeof actionIndex !== 'undefined' && actionIndex < agent.agentActions.length - 1) {
            logs.info(`No targets specified, Continuing to next action`, logid, `Continuing to next action`);
            return runAction({ actionIndex: actionIndex + 1 }, agent, inputs, logs);
        } else {
            logs.info(`No more actions to run, finishing...`, logid, `end of actions`);
            logs.close++;
            return;
        }

    }

    return async (agent: Agent, inputs: AgentInput[], logs: AgentLogs) => {
        setActionEvocationCount({});
        logs.open++;
        return await runAction({ actionIndex: 0 }, agent, inputs, logs);
    }
}

function resolveConnection(connections: Connection[], agentConnectionCriteria: AgentConnectionCriteria): Connection | undefined {
    let filteredConnections = connections.filter(x => x.active).filter(connection => {
        let isPassing: boolean = true;
        if (agentConnectionCriteria.mandatoryTag?.length) {
            isPassing = agentConnectionCriteria.mandatoryTag.every(tag => connection.tags.includes(tag));
        }
        if (agentConnectionCriteria.negativeMandatoryTag?.length) {
            isPassing = isPassing && !agentConnectionCriteria.negativeMandatoryTag.some(tag => connection.tags.includes(tag));
        }
        return isPassing;
    });
    return filteredConnections[0];
}

function resolveInputs(inputs: AgentInput[]): { key: string, value: string }[] {
    return inputs;
}

async function queryToLLM(context: string, instruction: string, connection: Connection, logs: AgentLogs): Promise<string> {
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
                { "role": "user", "content": instruction }
            ],
        })
    }).catch((reason) => {
        console.error("rejected", reason);
    });

    let responseJson = await response?.json();

    if (!responseJson.choices) {
        if (responseJson.error) {
            if (responseJson.error.message.includes("'Conversation roles must alternate user/assistant")) {
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
                            { "role": "user", "content": context },
                            { "role": "assistant", "content": "I understand, and your instruction?" },
                            { "role": "user", "content": instruction }
                        ]
                    })
                }).catch((reason) => {
                    console.error("rejected", reason);
                });

                if (!response) throw new Error("No response from LLM");

                let streamedResponse = await handleStreamedResponse(response);
                return streamedResponse;
            }
        }
    }

    return responseJson.choices[0]?.message?.content?.toString();
}

async function handleStreamedResponse(response: Response) {
    const reader = response.body?.getReader();
    if (!reader) throw new Error("No reader found in response");
    const decoder = new TextDecoder("utf-8");
    let result = "";
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += decoder.decode(value);
    }

    // Parsing the streamed result to extract the content
    const resultJson = JSON.parse(result);
    return resultJson.choices[0]?.message?.content?.toString();
}

function resolveScript(script: string, resolvedInputs: { key: string; value: string; }[]): string {
    try {
        validateScript(script);
    } catch (e) {
        throw e;
    }

    return script;
}

