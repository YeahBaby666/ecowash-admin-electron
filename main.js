require('dotenv').config();
const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('path');

// 1. Define tu variable (puedes alternar entre local y producción)
// Si tienes un archivo .env, tomará esa URL. Si no, usará localhost por defecto.
const API_URL = process.env.API_URL || 'https://ecowash-di2g.onrender.com'; 
// const API_URL = 'https://tu-app-ecowash.onrender.com' o 'http://localhost:9090';

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    frame: false, 
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true 
    }
  });

  mainWindow.loadFile('src/index.html');
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // 2. Inyección de la variable usando backticks ( ` ) y ${}
        'Content-Security-Policy': [`default-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com ${API_URL}`]
      }
    });
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Eventos IPC para controlar la ventana
ipcMain.on('window-minimize', () => mainWindow.minimize());
ipcMain.on('window-maximize', () => {
    if (mainWindow.isMaximized()) mainWindow.unmaximize();
    else mainWindow.maximize();
});
ipcMain.on('window-close', () => mainWindow.close());

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});