import React, { FunctionComponent } from 'react';
import withPersistedState from '../utils/withPersistedState';

const myJsonSchema = {
  title: "A registration form",
  type: "object",
  required: ["firstName", "lastName"],
  properties: {
    firstName: {
      type: "string",
      title: "First name",
    },
    lastName: {
      type: "string",
      title: "Last name",
    },
    testArray: {
      type: "array",
      title: "Test Array",
      items: {
        type: "object",
        properties: {
          test: {
            type: "string",
            title: "TestProps",
          },
          test2: {
            type: "string",
            title: "TestProps2",
          },
        },
      },
      additionalItems: {
        type: "string"
      },
    }
    // Define additional fields as needed
  },
};

const MyForm: FunctionComponent<any> = withPersistedState({formId:'settings',jsonSchema:myJsonSchema});

const Settings: React.FC = () => {
  return <MyForm>
  </MyForm>;
};

export default Settings;
