
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onNewFile: (callback) => ipcRenderer.on('new-file', callback),
    onOpenFile: (callback) => ipcRenderer.on('open-file', (_, content) => callback(_, content)),
    onSaveFile: (callback) => ipcRenderer.on('save-file', (_, filePath) => callback(_, filePath)),
    saveFileContent: (filePath, content) => ipcRenderer.send('save-file-content', filePath, content)
});
