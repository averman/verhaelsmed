import { draftjsToMarkdown, markdownToDraftjs } from './ConversionUtils';

describe('ConversionUtils', () => {
    it('should convert markdown to draftjs', () => {
        const input = `*italic* **bold** ~~strikethrough~~ [link](https://www.google.com)`;
        const output = {
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
        const draftJsObject = {
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
    
        const expectedMarkdown = `*italic* **bold** ~~strikethrough~~ [link](https://www.google.com)`;
    
        expect(draftjsToMarkdown(draftJsObject)).toEqual(expectedMarkdown);
    });
});