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
    tags: string[];
    maxTokenBudget: number;
    model: string;
  }

  export interface Agent {
    agentName: string;
    agentType: string;
    description: string;
    connectionCriteria: {
      sortBy: string[],
      mandatoryTag: string[],
      negativeMandatoryTag: string[]
    }
    maxRetryCount: number;
    timeout: number;
    inputs: {
      key: string;
      value: string;
    }[]
    mainPrompt: {
      systemContext: string,
      instruction: string
    }
    parser?: {
      type: string,
      systemContext: string,
      instruction: string
    };
    verifier?:  {
      type: string,
      systemContext: string,
      instruction: string
    };
    decider?: {
      type: string,
      systemContext: string,
      instruction: string,
      targets: {
        description: string,
        targetName: string
      }[]
    };
    saveAs?: string;
  }
  
  export interface ProjectSettings {
    projectId: string;
    projectName: string;
    projectDescription?: string;
    connections?: Connection[];
    agents?: Agent[];
  }
  