# Verhaelsmed Agent Documentation

## Overview

Agents in Verhaelsmed are designed to perform a variety of tasks by executing a sequence of actions. These actions can interact with external services, execute scripts, or call native functions within the application. This guide provides a high-level overview of how agents are used in Verhaelsmed, helping new developers understand their role and how they fit into the overall architecture.

## Agent Structure

### Agent Metadata

- **agentType**: Defines the type of the agent, indicating its primary function (e.g., "summarize").
- **agentName**: A human-readable name for the agent, used for identification and reference.

### Agent Actions

An agent comprises multiple actions, each defined with a specific purpose. Actions are executed sequentially by default but can dynamically target other actions based on specific conditions or results.

#### Types of Actions

1. **Native Actions**
   - **Purpose**: Call native functions within Verhaelsmed to interact with the application.
   - **Example**: Fetching narratives or updating summaries.
   - **Properties**: 
     - `nativeAction`: The native function to be called.
     - `parameters`: Parameters to be passed to the native function.
     - `connectionCriteria`: Criteria for selecting connections (usually empty for native actions).
     - `maxEvokedCount`: Maximum number of times the action can be evoked.
     - `saveAs`: Variable name to store the result.

2. **Prompt Actions**
   - **Purpose**: Invoke API calls to Language Model (LLM) for tasks such as text summarization or generation.
   - **Example**: Summarizing a text while maintaining the plot and details.
   - **Properties**:
     - `connectionCriteria`: Criteria for selecting the appropriate connection based on tags.
     - `systemContext`: Context provided to the LLM for understanding the task.
     - `instruction`: Detailed instructions for the LLM.
     - `parameters`: Parameters to be passed in the instruction.
     - `saveAs`: Variable name to store the result.
     - `maxEvokedCount`: Maximum number of times the action can be evoked.

3. **Script Actions**
   - **Purpose**: Execute custom scripts for complex logic or conditional operations.
   - **Example**: Processing data or performing calculations.
   - **Properties**:
     - `script`: The script to be executed.
     - `parameters`: Parameters to be used within the script.
     - `saveAs`: Variable name to store the result.
     - `maxEvokedCount`: Maximum number of times the action can be evoked.

## Connections

Connections define the base properties required for making API calls to external services, such as LLMs. Verhaelsmed supports multiple connections, each with unique properties and tags.

### Connection Properties

- **connectionHost**: The host URL for the API.
- **connectionId**: Unique identifier for the connection.
- **connectionName**: Human-readable name for the connection.
- **connectionKey**: Authorization key for accessing the API.
- **tags**: Tags associated with the connection for filtering and selection.
- **active**: Indicates if the connection is currently active.
- **maxTokenBudget**: Maximum token budget for the API calls.
- **model**: The model to be used for the API calls.

### Connection Criteria

Prompt actions use connection criteria to select the appropriate connection based on tags. Criteria include:

- **sortBy**: Sorting preferences for selecting connections.
- **mandatoryTag**: Tags that must be present in the connection.
- **negativeMandatoryTag**: Tags that must not be present in the connection.

## Execution Environment

Agents are executed within the application using a custom hook (`useRunAgent`). The execution involves:

1. **Agent Lookup**: Identifying the agent configuration by its name.
2. **Input Preparation**: Preparing inputs based on the current context or user interaction.
3. **Sequential Execution**: Running each action in sequence or based on dynamic targets.
4. **Logging**: Capturing logs for monitoring and debugging purposes.
5. **Error Handling**: Managing errors and ensuring robust execution with retry mechanisms.

## Example Use Case: Summarizing Agent

A typical summarizing agent performs the following steps:

1. **Retrieve Context**:
   - Uses a native action to fetch narratives before a certain timeline.
   - Saves the retrieved context for use in subsequent actions.

2. **Summarize Text**:
   - Uses a prompt action to interact with an LLM, providing context and detailed instructions for summarizing the text.
   - Ensures the summary maintains the plot and detail within specified length constraints.
   - Saves the summarized result.

3. **Set Summary**:
   - Uses a native action to update the narrative with the summarized text.

## Customization and Extensibility

Verhaelsmed allows end-users to define and customize agent behavior through:

- **Direct Configuration**: Users can specify the behavior of prompt, script, and native actions.
- **Dynamic Targeting**: Agents can invoke other actions dynamically based on conditions or results, enhancing flexibility and control.

## Conclusion

Agents in Verhaelsmed provide a powerful and flexible mechanism for automating tasks, interacting with external services, and executing complex workflows. By understanding the high-level structure and capabilities of agents, developers can effectively leverage them to build sophisticated functionalities within the application.

For detailed implementation and code examples, refer to the codebase in the repository.