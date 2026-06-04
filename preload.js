const { contextBridge, ipcRenderer } = require('electron');

// Expose IPC renderer methods to window object
contextBridge.exposeInMainWorld('electron', {
  savePDF: (htmlContent, defaultFileName) => 
    ipcRenderer.invoke('save-pdf', { htmlContent, defaultFileName }),
  
  saveBackup: (backupData, defaultFileName) => 
    ipcRenderer.invoke('save-backup', { backupData, defaultFileName }),
  
  loadBackup: () => 
    ipcRenderer.invoke('load-backup')
});
