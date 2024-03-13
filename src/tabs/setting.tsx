import React, { FunctionComponent } from 'react';
import Form from '@rjsf/mui';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
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
    // Define additional fields as needed
  },
};

const MyForm: FunctionComponent<any> = withPersistedState('settings',myJsonSchema);

const Settings: React.FC = () => {
  return <MyForm/>;
};

export default Settings;
