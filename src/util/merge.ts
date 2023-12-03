const merge: object = (a: any, b: any) => {
  if (typeof a === "object" && typeof b === "object") {
    const merged: Record<string, any> = {};
    for (const key in a) {
      merged[key] = a[key];
    }
    for (const key in b) {
      merged[key] = b[key];
    }
    return merged;
  } else {
    return a;
  }
};

export { merge };
