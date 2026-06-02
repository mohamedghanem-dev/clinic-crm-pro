// ================================================
//  عيادتي CRM — Electron Main Process
//  Local storage: localStorage via Chromium
// ================================================

const { app, BrowserWindow, Menu, shell, ipcMain } = require('electron');
const path = require('path');

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
