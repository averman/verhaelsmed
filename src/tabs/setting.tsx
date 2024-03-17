import React, { FunctionComponent } from 'react';
import { UiSchema } from '@rjsf/utils';
import { randomString } from '../utils/Random';
import withPersistedState from '../utils/withPersistedState';

const jsonSchema = {
  title: "A registration form",
  type: "object",
  required: ["projectName"],
  properties: {
    projectId: {
      type: "string",
      title: "Project ID",
      default: randomString(8),
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

const uiSchema: UiSchema = {
  projectId: {
    "ui:readonly": true
  },
  projectName: {
    "ui:autofocus": true,
    "ui:emptyValue": "",
  },
  projectDescription: {
    "ui:widget": "textarea",
  },
}

const Settings: React.FC = () => {

  const SettingsForm: FunctionComponent<any> = withPersistedState({
    formId:'settings',
    jsonSchema: jsonSchema,
    jsonSchemaUi:uiSchema,
    saveAsKey:'projectId'
  });

  return <>
    <SettingsForm>
    </SettingsForm>
  </>
};

export default Settings;
