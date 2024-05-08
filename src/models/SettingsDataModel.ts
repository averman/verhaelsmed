import { RJSFSchema } from "@rjsf/utils";

export const jsonSchema: RJSFSchema = {
    title: "Project Settings",
    type: "object",
    required: ["projectName"],
    properties: {
      projectId: {
        type: "string",
        title: "Project ID",
        default: "",
      },
      projectName: {
        type: "string",
        title: "Project Name",
      },
      projectDescription: {
        type: "string",
        title: "Project Description",
      },
      connections: {
        type: "array",
        title: "Connections",
        items: {
          type: "object"
        }
      },
      agents: {
        type: "array",
        title: "AI Agents",
        items: {
          type: "object"
        }
      }
    },
  };

  export interface Connection {
    connectionHost: string;
    connectionId: string;
    connectionName: string;
    connectionKey: string;
    tags: string[];
    maxTokenBudget: number;
    model: string;
  }

  export interface AgentInput {
    key: string;
    value: string;
  }

  export interface AgentConnectionCriteria {
    sortBy: string[],
    mandatoryTag: string[],
    negativeMandatoryTag: string[]
  }

  export interface AgentAction {
    name: string;
    type: string;
    saveAs?: string;
    maxEvokedCount?: string;
    targets: {
      description: string;
      targetName: string;
    }[];
  }

  export interface AgentPrompt extends AgentAction{
    connectionCriteria: AgentConnectionCriteria;
    systemContext: string;
    instruction: string;
  }

  export function isAgentPrompt(action: AgentAction): action is AgentPrompt {
    return action.type === 'prompt' && 'systemContext' in action && 'instruction' in action && 'connectionCriteria' in action;
  }

  export interface AgentScript extends AgentAction{
    script: string;
  }

  export function isAgentScript(action: AgentAction): action is AgentScript {
    return action.type === 'script' && 'script' in action;
  }

  export interface AgentNativeAction extends AgentAction{
    nativeAction: string;
    parameters: string[];
  }

  export function isAgentNativeAction(action: AgentAction): action is AgentNativeAction {
    return action.type === 'native' && 'nativeAction' in action && 'parameters' in action;
  }

  export interface Agent {
    agentName: string;
    agentType: string;
    description: string;
    maxRetryCount: number;
    timeout: number;
    inputs: AgentInput[];
    agentActions: (AgentPrompt | AgentScript | AgentNativeAction) []
    // mainPrompt: {
    //   systemContext: string,
    //   instruction: string
    // }
    // parser?: {
    //   type: string,
    //   systemContext: string,
    //   instruction: string
    // };
    // validator?:  {
    //   type: string,
    //   systemContext: string,
    //   instruction: string
    // };
    // decider?: {
    //   type: string,
    //   systemContext: string,
    //   instruction: string,
    //   targets: {
    //     description: string,
    //     targetName: string
    //   }[]
    // };
    saveAs?: string;
  }
  
  export interface ProjectSettings {
    projectId: string;
    projectName: string;
    projectDescription?: string;
    connections?: Connection[];
    agents?: Agent[];
  }
  