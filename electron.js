// ================================================
//  عيادتي CRM — Electron Main Process
//  Local storage: localStorage via Chromium
// ================================================

const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Arabic menu support
app.commandLine.appendSwitch('lang', 'ar');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'عيادتي CRM',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false
    },
    backgroundColor: '#0D1B2A',
    show: false,
    autoHideMenuBar: true
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => { mainWindow = null; });

  // Custom minimal menu
  const template = [
    {
      label: 'النظام',
      submenu: [
        { label: 'إعادة تحميل', accelerator: 'F5', role: 'reload' },
        { label: 'تكبير/تصغير', accelerator: 'F11', role: 'togglefullscreen' },
        { type: 'separator' },
        { label: 'إغلاق', accelerator: 'Alt+F4', role: 'quit' }
      ]
    },
    {
      label: 'تحرير',
      submenu: [
        { label: 'نسخ', role: 'copy' },
        { label: 'لصق', role: 'paste' },
        { label: 'تحديد الكل', role: 'selectAll' }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// IPC Handlers for PDF Export
ipcMain.handle('save-pdf', async (event, { htmlContent, defaultFileName }) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(require('os').homedir(), 'Downloads', defaultFileName || 'export.html'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) return { success: false, error: 'Save canceled' };

  try {
    fs.writeFileSync(result.filePath, htmlContent, 'utf-8');
    // Open the file for printing/PDF conversion
    shell.openPath(result.filePath);
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for Backup
ipcMain.handle('save-backup', async (event, { backupData, defaultFileName }) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(require('os').homedir(), 'Downloads', defaultFileName || 'clinic-backup.json'),
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled) return { success: false, error: 'Save canceled' };

  try {
    fs.writeFileSync(result.filePath, JSON.stringify(backupData, null, 2), 'utf-8');
    return { success: true, filePath: result.filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// IPC Handler for Restore
ipcMain.handle('load-backup', async (event) => {
  if (!mainWindow) return { success: false, error: 'Window not available' };
  
  const result = await dialog.showOpenDialog(mainWindow, {
    defaultPath: require('os').homedir(),
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });

  if (result.canceled) return { success: false, error: 'Open canceled' };

  try {
    const filePath = result.filePaths[0];
    const data = fs.readFileSync(filePath, 'utf-8');
    const backupData = JSON.parse(data);
    return { success: true, data: backupData, filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});
