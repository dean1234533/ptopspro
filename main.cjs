const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs   = require('fs');

const isDev = process.env.NODE_ENV === 'development';

function dataPath(key) {
  return path.join(app.getPath('userData'), `${key}.json`);
}

app.whenReady().then(() => {
  ipcMain.handle('read-data', (_, key) => {
    try { return JSON.parse(fs.readFileSync(dataPath(key), 'utf8')); }
    catch { return []; }
  });

  ipcMain.handle('write-data', (_, key, data) => {
    fs.writeFileSync(dataPath(key), JSON.stringify(data), 'utf8');
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

function createWindow() {
  const win = new BrowserWindow({
    width:           430,
    height:          860,
    minWidth:        380,
    minHeight:       600,
    title:           'PT Ops Pro',
    backgroundColor: '#030712',
    webPreferences: {
      preload:          path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration:  false,
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  if (process.platform !== 'darwin') win.setMenuBarVisibility(false);
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
