function getIpcRenderer(): any {
  return window.require("electron").ipcRenderer;
}

export { getIpcRenderer };
