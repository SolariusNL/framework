type DeepPartial<T> = {
  [K in keyof T]?: DeepPartial<T[K]>;
};

function select<T>(obj: DeepPartial<T>, ...keys: string[]): { [key: string]: any } {
  const result: { [key: string]: any } = {};

  for (const key of keys) {
    const keyParts = key.split(".") as Array<keyof T>;
    let selectedValue: any = obj;
    let nestedResult: any = result;

    for (const [index, k] of keyParts.entries()) {
      if (selectedValue && typeof selectedValue === "object" && k in selectedValue) {
        selectedValue = selectedValue[k];
        if (index === keyParts.length - 1) {
          nestedResult[k] = selectedValue;
        } else {
          nestedResult[k] = nestedResult[k] || {};
          nestedResult = nestedResult[k];
        }
      } else {
        selectedValue = undefined;
        break;
      }
    }
  }

  return result;
}

export default select;
