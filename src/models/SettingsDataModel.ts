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
    },
  };
  
  export interface ProjectSettings {
    projectId: string;
    projectName: string;
    projectDescription?: string;
  }
  