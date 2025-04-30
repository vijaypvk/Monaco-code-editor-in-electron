

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    runPython: (code) => ipcRenderer.invoke("run-python", code),
    saveNotebook: (data) => ipcRenderer.invoke("save-notebook", data),
    loadNotebook: () => ipcRenderer.invoke("load-notebook")
});

