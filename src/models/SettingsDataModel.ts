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
          type: "object",
          properties: {
            connectionId: {
              type: "string",
              title: "connection name",
            },
            connectionHost: {
              type: "string",
              title: "host",
            },
            connectionKey: {
              type: "string",
              title: "apiKey",
            },
            maxTokenBudget: {
              type: "number",
              title: "Max Token Budget",
            },
            tags: {
              type: "array",
              title: "Tags",
              items: {
                type: "string",
                title: "Tag",
                enum: ["$", "$$", "$$$", "$$$$", "$$$$$", "censored", "<15B", "15B-80B", ">80B", "instruct", "roleplay", "chat", "mistral", "gpt", "llama2"] 
              }
            }
          },
        },
      }
    },
  };

  export interface Connection {
    connectionHost: string;
    connectionId: string;
    connectionName: string;
    tags: string[];
    maxTokenBudget: number;
  }
  
  export interface ProjectSettings {
    projectId: string;
    projectName: string;
    projectDescription?: string;
    connections?: Connection[];
  }
  