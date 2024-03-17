export function markdownToDraftjs(input: string): any {
    let result: any = {
        cleanText: "",
        styleRanges: []
    };

    let cursor = 0;
    while (cursor < input.length) {
        // Bold or Italic
        if ((input[cursor] === "*" || input[cursor] === "_") && (input[cursor + 1] !== undefined && input[cursor + 1] === input[cursor])) {
            let start = cursor;
            cursor += 2; // Skip the initial "**" or "__"
            let end = input.indexOf(input[start] + input[start], cursor);
            if (end !== -1) {
                let length = end - cursor;
                result.styleRanges.push({ offset: result.cleanText.length, length: length, style: 'BOLD' });
                result.cleanText += input.substring(cursor, end);
                cursor = end + 2; // Move past the closing "**" or "__"
            }
        } else if (input[cursor] === "*" || input[cursor] === "_") {
            let start = cursor;
            cursor += 1; // Skip the initial "*" or "_"
            let end = input.indexOf(input[start], cursor);
            if (end !== -1) {
                let length = end - cursor;
                result.styleRanges.push({ offset: result.cleanText.length, length: length, style: 'ITALIC' });
                result.cleanText += input.substring(cursor, end);
                cursor = end + 1; // Move past the closing "*" or "_"
            }
        } 
        // Strikethrough
        else if (input[cursor] === "~" && (input[cursor + 1] !== undefined && input[cursor + 1] === "~")) {
            cursor += 2; // Skip the initial "~~"
            let end = input.indexOf("~~", cursor);
            if (end !== -1) {
                let length = end - cursor;
                result.styleRanges.push({ offset: result.cleanText.length, length: length, style: 'STRIKETHROUGH' });
                result.cleanText += input.substring(cursor, end);
                cursor = end + 2; // Move past the closing "~~"
            }
        } 
        // Link
        else if (input[cursor] === "[") {
            let endBracket = input.indexOf("]", cursor + 1);
            let startParenthesis = input.indexOf("(", endBracket);
            let endParenthesis = input.indexOf(")", startParenthesis + 1);
            if (endBracket !== -1 && startParenthesis !== -1 && endParenthesis !== -1) {
                let linkText = input.substring(cursor + 1, endBracket);
                let linkUrl = input.substring(startParenthesis + 1, endParenthesis);
                result.styleRanges.push({
                    offset: result.cleanText.length,
                    length: linkText.length,
                    style: 'LINK',
                    entity: { 
                        data: {
                            url: linkUrl,
                            className: "MUIRichTextEditor-anchorLink-12"
                        },
                        mutability: "MUTABLE",
                        type: "LINK"
                    }
                });
                result.cleanText += linkText;
                cursor = endParenthesis + 1; // Ensure this moves past the link syntax correctly
            } else {
                // If link syntax is not correctly closed, treat as normal text
                result.cleanText += input[cursor];
                cursor++;
            }
        }
        // Handling other characters, including new lines as spaces
        else if (input[cursor] === "\n") {
            result.cleanText += " ";
            cursor++;
        } else {
            result.cleanText += input[cursor];
            cursor++;
        }
    }

    return result;
}

export function draftjsToMarkdown(draftjsData: any): string {
    let markdown = "";

    let text = draftjsData.cleanText;
    const styles = draftjsData.styleRanges;

    // Sort styles by offset to handle them in order
    styles.sort((a: any, b: any) => a.offset - b.offset);

    let lastIndex = 0;
    styles.forEach((style: any) => {
        // Add text before the styled range
        markdown += text.substring(lastIndex, style.offset);
        // Add the styled text based on the style type
        switch (style.style) {
            case 'BOLD':
                markdown += `**${text.substring(style.offset, style.offset + style.length)}**`;
                break;
            case 'ITALIC':
                markdown += `*${text.substring(style.offset, style.offset + style.length)}*`;
                break;
            case 'STRIKETHROUGH':
                markdown += `~~${text.substring(style.offset, style.offset + style.length)}~~`;
                break;
            case 'CODE':
                markdown += `\`${text.substring(style.offset, style.offset + style.length)}\``;
                break;
            case 'LINK':
                let entity = style.entity;
                markdown += `[${text.substring(style.offset, style.offset + style.length)}](${entity.data.url})`;
                break;
            case 'IMAGE':
                markdown += `![${text.substring(style.offset, style.offset + style.length)}](${style.data.url})`;
                break;
            default:
                markdown += text.substring(style.offset, style.offset + style.length);
                break;
        }
        lastIndex = style.offset + style.length;
    });

    // Add remaining text after the last style
    markdown += text.substring(lastIndex);
    // Add a newline for block separation
    markdown += "\n";

    return markdown.trim(); // Trim the trailing newline
}

export function gatherBlocks(blocks: string[]): string {
    let entityMap: any = {};
    blocks.forEach((block, index) => {
        entityMap = Object.assign(entityMap, JSON.parse(block).data);
    });
    return `{ "blocks": [${blocks.join(",")}], "entityMap": ${JSON.stringify(entityMap)} }`
}

