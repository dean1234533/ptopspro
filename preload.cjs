const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readData:  (key)       => ipcRenderer.invoke('read-data', key),
  writeData: (key, data) => ipcRenderer.invoke('write-data', key, data),
});
