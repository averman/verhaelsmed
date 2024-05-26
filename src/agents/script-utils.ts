import exp from "constants";

function validateScript(script: string): void {
    // Check for data sending capabilities
    const dataSendingPatterns: RegExp[] = [
        /\bfetch\b/,
        /\bXMLHttpRequest\b/,
        /\baxios\b/,
        /\bnavigator\.sendBeacon\b/,
        /\blocation(\.href)?\s*=/,
        /\b$.ajax\b/,
        /\b$.get\b/,
        /\b$.post\b/
    ];
    dataSendingPatterns.forEach(pattern => {
        if (pattern.test(script)) {
            throw new Error(`Script validation error: Data sending attempt detected with pattern ${pattern}.`);
        }
    });

    // Check for code evaluation functionalities
    const evalPatterns: RegExp[] = [
        /\beval\b/,
        /new\s+Function/,
        /\bsetTimeout\b\([^,]*,/,
        /\bsetInterval\b\([^,]*,/,
        /new\s+Worker\(/,
    ];
    evalPatterns.forEach(pattern => {
        if (pattern.test(script)) {
            throw new Error(`Script validation error: Code evaluation attempt detected with pattern ${pattern}.`);
        }
    });

    // Check for access to client-side storage
    const storageAccessPatterns: RegExp[] = [
        /\bdocument\.cookie\b/,
        /\blocalStorage\b/,
        /\bsessionStorage\b/,
        /\bindexedDB\b/
    ];
    storageAccessPatterns.forEach(pattern => {
        if (pattern.test(script)) {
            throw new Error(`Script validation error: Client-side storage access attempt detected with pattern ${pattern}.`);
        }
    });
}

export { validateScript}