# Verhaelsmed Narrative Guide

Welcome to the Verhaelsmed development team! This guide is designed to provide you with a high-level understanding of the narrative management system within Verhaelsmed. This will help you get up to speed quickly and understand how narratives are structured and managed in the application.

## Introduction to Narratives

In Verhaelsmed, narratives are the core components that represent different parts of a story. They are designed to be flexible and can encompass various forms of content, such as prose and lore. The system is built to manage, organize, and present these narratives effectively.

## Key Concepts

### Narrative
A narrative is an abstract concept that represents a piece of the story. It can be anything from a simple paragraph to a complex lore entry. Narratives are stored in IndexedDB for persistence and can be categorized and managed using various fields and methods.

### Types of Narratives
1. **ProseNarrative**: This type of narrative is used for traditional prose content. It includes the main text and various summary levels to help writers manage different versions of their content.
2. **LoreNarrative**: This type of narrative is used for lore elements such as characters, settings, and other story-specific details. Lore narratives include conditions and items that help in dynamically presenting the lore based on specific inputs.

## Narrative Fields and Methods

### Common Fields
- **timeline**: A numerical value that represents the position of the narrative in the story's timeline.
- **tags**: A collection of tags associated with the narrative, used for categorization and filtering.
- **group**: Identifies if the narrative belongs to a specific group.

### ProseNarrative Specifics
- **text**: The main content of the prose.
- **summaries**: Different summary levels of the prose content.
- **getNormalizedText**: A method that automatically retrieves the current summary level text.

### LoreNarrative Specifics
- **loreType**: The type of lore (e.g., character, setting).
- **items**: Key-value pairs representing different attributes of the lore narrative.
- **conditions**: A custom function that maps inputs to an array of item keys, allowing dynamic filtering of relevant lore items. By default, this function returns all items.

## Narrative Management

### Grouping and Filtering
Grouping is typically handled at the React component level, where narratives with the same group tag are nested under a parent narrative. Filtering is used to display specific narratives based on selected criteria.

### Serialization and Deserialization
Narratives are serialized into JSON strings for storage and deserialized back into objects when needed. This ensures easy storage and retrieval from IndexedDB. Custom serializers may be introduced in the future for enhanced functionality.

## How the System Works in the Background

### Tagging
When a user tags a narrative, the tags are stored as part of the narrative object. The system uses these tags to categorize and filter narratives efficiently. Tags are indexed in IndexedDB to enable quick search and retrieval operations.

### Summary Levels
For `ProseNarrative`, the summaries field allows different versions of the narrative content to be stored. Users need to manually summarize the text or use an AI agent to assist with this task. The `getNormalizedText` method is used to retrieve the current summary level text automatically.

### Dynamic Lore Management
`LoreNarrative` includes dynamic lore management through conditions and items. When a user interacts with lore content, the system evaluates the conditions function to determine which items are relevant based on the given inputs. By default, the conditions function returns all items, but it can be customized by the end user to filter relevant lore items based on specific inputs.

## Working with the Narrative System

### Adding New Narrative Types
To add a new narrative type, you need to:
1. Define a new class that extends the `Narrative` base class.
2. Implement the necessary fields and methods specific to the new narrative type.
3. Register the new narrative type with the narrative factory.

### Handling Changes
The narrative system includes handlers that respond to changes in narratives. For example, prose narratives have a handler that splits the content into multiple parts if it contains five consecutive newlines. These handlers ensure that the narrative content is managed consistently.

## Conclusion

Understanding the narrative system is crucial for working effectively on Verhaelsmed. This guide provides a high-level overview to help you get started. For detailed implementations and code structure, refer to the source code in the repository. Welcome to the team, and happy coding!