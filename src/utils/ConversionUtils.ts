const headerLevelMap:any = {
    'header-1': 'header-one',
    'header-2': 'header-two',
    'header-3': 'header-three',
    'header-4': 'header-four',
    'header-5': 'header-five',
    'header-6': 'header-six'
}

export function markdownToDraftjs(input: string): any {
    let result: any = {
        cleanText: "",
        styleRanges: [],
        blockType: "unstyled"
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
        } else if (input[cursor] === ">") {
            let end = input.indexOf("\n", cursor) === -1 ? input.length : input.indexOf("\n", cursor);
            result.blockType = "blockquote";
            result.cleanText += input.substring(cursor + 1, end).trim();
            cursor = end;
        }
        else if (input.substring(cursor, cursor + 3) === "```") {
            let end = input.indexOf("```", cursor + 3) + 3;
            end = end === 2 ? input.length : end; // If no closing ```, go to the end of the input
            result.blockType = "code-block";
            result.cleanText += input.substring(cursor + 3, end - 3);
            cursor = end;
        }
        else if (input[cursor] === "`") {
            let end = input.indexOf("`", cursor + 1) + 1;
            end = end === 0 ? input.length : end; // If no closing `, go to the end of the input
            result.styleRanges.push({ offset: result.cleanText.length, length: end - cursor - 2, style: 'CODE' });
            result.cleanText += input.substring(cursor + 1, end - 1);
            cursor = end;
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
        } else if (input.startsWith("#")) {
            let end = input.indexOf(" ", cursor);
            let level = end - cursor;
            result.blockType = headerLevelMap[`header-${level}`];
            result.cleanText += input.substring(end + 1);
            cursor = input.length; // Move cursor to the end as the whole line is consumed
        } else {
            result.cleanText += input[cursor];
            cursor++;
        }
    }

    return result;
}

export function draftjsToMarkdown(draftjsData: any): string {
    let markdown = "";

    let text = draftjsData.text;
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

    if(draftjsData.type){
        switch (draftjsData.type) {
            case "header-one":
                markdown = `# ${text}`;
                break;
            case "header-two":
                markdown = `## ${text}`;
                break;
            case "header-three":
                markdown = `### ${text}`;
                break;
            case "header-four":
                markdown = `#### ${text}`;
                break;
            case "header-five":
                markdown = `##### ${text}`;
                break;
            case "header-six":
                markdown = `###### ${text}`;
                break;
            case "blockquote":
                markdown = `> ${text}`;
                break;
            case "code-block":
                markdown = "```\n" + text + "\n```";
                break;
            default:
                break;
        }
    } else {
        markdown += text.substring(lastIndex);
    }

    return markdown.trim(); // Trim the trailing newline
}

export function gatherBlocks(blocks: string[]): string {
    let entityMap: any = {};
    blocks.forEach((block, index) => {
        entityMap = Object.assign(entityMap, JSON.parse(block).data);
    });
    let result = `{ "blocks": [${blocks.join(",")}], "entityMap": ${JSON.stringify(entityMap)} }`
    console.log(result);
    return result;
}

