function getIpcRenderer(): any {
  return (window as any).native;
}

export { getIpcRenderer };
