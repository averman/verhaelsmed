export function randomString(n: number, exclude: string[] = []): string {
    let result = Math.random().toString(36).substring(2, 2 + n);
    if (exclude.includes(result)) {
        return randomString(n, exclude);
    }
    return result;
}