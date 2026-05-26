const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Aquí puedes agregar métodos que requieran acceso directo a Node.js
  // Por ahora, el renderer.js usará fetch nativo para consumir el Spring Boot
});