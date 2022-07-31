export function exclude(source: any, ...exclude: any[]): any {
  const result = {} as any;
  for (const key in source) {
    if (!exclude.includes(key)) {
      result[key] = source[key];
    }
  }

  return result;
}