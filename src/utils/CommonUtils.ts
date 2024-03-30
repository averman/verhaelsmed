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

export function getCommonTags(objects: {[key: string]: string[]}[]): {[key: string]: string[]} {
  // set new tag Object that is a key value pair that exist on all selected editors
  let newTags: {[key: string]: string[]} = {};
  // get all distinct keys from objects
  let keys = objects.map(x=>Object.keys(x)).reduce((acc, val) => acc.filter(x => val.includes(x)));
  for(let key of keys){
      // get all values that exist in all objects for a given key
      let values = objects.map(x=>x[key]).reduce((acc, val) => acc.filter(x => val.includes(x)));
      for(let value of values){
          if(newTags[key]){
              newTags[key].push(value)
          } else {
              newTags[key] = [value]
          }
      }
  }
  return newTags;
}