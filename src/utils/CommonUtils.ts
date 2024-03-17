export function getFromKey(obj: any, keys: string, defaultValue: any) {
  const keyArray = keys.split('.');
    let current = obj;
    for (let i = 0; i < keyArray.length; i++) {
        if (current[keyArray[i]] === undefined) {
            return defaultValue;
        }
        current = current[keyArray[i]];
    }
  return current;
}