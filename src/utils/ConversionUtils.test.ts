import { draftjsToMarkdown, markdownToDraftjs } from './ConversionUtils';

describe('ConversionUtils', () => {
    it('should convert markdown to draftjs', () => {
        const input = `*italic* **bold** ~~strikethrough~~ [link](https://www.google.com)`;
        const output = {
        blockType: "unstyled",
        cleanText: "italic bold strikethrough link",
        styleRanges: [
            { offset: 0, length: 6, style: 'ITALIC' },
            { offset: 7, length: 4, style: 'BOLD' },
            { offset: 12, length: 13, style: 'STRIKETHROUGH' },
            { offset: 26, length: 4, style: 'LINK', entity: {
                data: { 
                    url: 'https://www.google.com',
                    className: "MUIRichTextEditor-anchorLink-12"
                },
                mutability: "MUTABLE",
                type: "LINK"
            } }
        ]
        };
        expect(markdownToDraftjs(input)).toEqual(output);
    });

    it('should convert draftjs to markdown', () => {
        const entity = {
            data: { 
                url: 'https://www.google.com',
                className: "MUIRichTextEditor-anchorLink-12"
            },
            mutability: "MUTABLE",
            type: "LINK"
        }
        const draftJsObject = {
          text: "italic bold strikethrough link",
          type: "unstyled",
          styleRanges: [
            { offset: 0, length: 6, style: 'ITALIC' },
            { offset: 7, length: 4, style: 'BOLD' },
            { offset: 12, length: 13, style: 'STRIKETHROUGH' },
            { offset: 26, length: 4, style: 'LINK', entity: entity }
          ]
        };
    
        const expectedMarkdown = `*italic* **bold** ~~strikethrough~~ [link](https://www.google.com)`;
    
        expect(draftjsToMarkdown(draftJsObject)).toEqual(expectedMarkdown);
    });

    it('should convert draftjs header to markdown', () => {
        const draftJsObject = {
            text: "Header",
            type: "header-one",
            styleRanges: []
        };
        const expectedMarkdown = `# Header`;
        expect(draftjsToMarkdown(draftJsObject)).toEqual(expectedMarkdown);
    });

    it('should convert markdown header to draftjs', () => {
        const input = `# Header`;
        const output = {
            blockType: "header-one",
            cleanText: "Header",
            styleRanges: []
        };
        expect(markdownToDraftjs(input)).toEqual(output);
    });

    it('should convert draftjs blockquote to markdown', () => {
        const draftJsObject = {
            text: "Quote",
            type: "blockquote",
            styleRanges: []
        };
        const expectedMarkdown = `> Quote`;
        expect(draftjsToMarkdown(draftJsObject)).toEqual(expectedMarkdown);
    });

    it('should convert markdown blockquote to draftjs', () => {
        const input = `> Quote`;
        const output = {
            blockType: "blockquote",
            cleanText: "Quote",
            styleRanges: []
        };
        expect(markdownToDraftjs(input)).toEqual(output);
    });

    it('should convert draftjs code-block to markdown', () => {
        const draftJsObject = {
            text: "Code",
            type: "code-block",
            styleRanges: []
        };
        const expectedMarkdown = `\`\`\`\nCode\n\`\`\``;
        console.log(draftjsToMarkdown(draftJsObject))
        expect(draftjsToMarkdown(draftJsObject)).toEqual(expectedMarkdown);
    });

    it('should convert markdown code-block to draftjs', () => {
        const input = `\`\`\`Code\`\`\``;
        const output = {
            blockType: "code-block",
            cleanText: "Code",
            styleRanges: []
        };
        expect(markdownToDraftjs(input)).toEqual(output);
    });
});